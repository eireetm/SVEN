import { expect, test, type Browser, type Page } from "@playwright/test";
import { answer, useSettings } from "./helpers";

// Online play (docs/online.md): two programs connect — by codes passed by hand (no relay: runs offline), or by a room code
// through the public relays (SVE_E2E_ONLINE=1: needs the internet) — then chat, prepare a game (the host's rules, each
// player's deck, ready), play it, one concedes, and they prepare another. Each page is one player's program.

async function openOnline(browser: Browser, settings: Record<string, unknown> = {}, prepare?: (page: Page) => Promise<void>): Promise<Page> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await useSettings(page, { uiLang: "en", ...settings });
  await prepare?.(page);
  await page.goto("/");
  await expect(page.getByTestId("menu-online")).toBeEnabled({ timeout: 120_000 });
  await page.getByTestId("menu-online").click();
  await expect(page.getByTestId("online")).toHaveAttribute("data-phase", "idle");
  return page;
}

/** Codes by hand: the host's connection code to the guest, the guest's reply code back. */
async function connectByHand(host: Page, guest: Page): Promise<void> {
  await host.locator(".sve-online-manual summary").click();
  await host.getByTestId("online-manual-host").click();
  const offer = await host.getByTestId("online-offer-code").inputValue({ timeout: 20_000 });
  expect(offer).toMatch(/^SVE1-O-/);
  await guest.locator(".sve-online-manual summary").click();
  await guest.getByTestId("online-offer-input").fill(offer);
  await guest.getByTestId("online-manual-join").click();
  const reply = await guest.getByTestId("online-reply-code").inputValue({ timeout: 20_000 });
  expect(reply).toMatch(/^SVE1-A-/);
  await host.getByTestId("online-reply-input").fill(reply);
  await host.getByTestId("online-connect").click();
  await expect(host.getByTestId("online-via")).toHaveText("codes passed by hand", { timeout: 30_000 });
  for (const page of [host, guest]) {
    await expect(page.getByTestId("online-connected")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("online-same")).toHaveText("Both programs are the same version (cards, rules, restriction lists).");
  }
}

async function chatBothWays(host: Page, guest: Page): Promise<void> {
  for (const page of [host, guest]) await expect(page.getByTestId("online-rtt")).toHaveText(/\d+ ms/, { timeout: 15_000 });
  await host.getByTestId("online-chat-input").fill("hello from the host");
  await host.getByTestId("online-send").click();
  await expect(guest.getByTestId("online-chat")).toContainText("hello from the host");
  await guest.getByTestId("online-chat-input").fill("こんにちは");
  await guest.getByTestId("online-send").click();
  await expect(host.getByTestId("online-chat")).toContainText("こんにちは");
  // The host leaves: the guest is told.
  await host.getByTestId("online-leave").click();
  await expect(guest.getByTestId("online-closed")).toHaveText("The other player left.");
}

test("two programs connect with codes passed by hand, chat, and one leaves", async ({ browser }) => {
  test.setTimeout(120_000);
  const host = await openOnline(browser);
  const guest = await openOnline(browser);
  // A wrong code is refused.
  await guest.locator(".sve-online-manual summary").click();
  await guest.getByTestId("online-offer-input").fill("not a code");
  await guest.getByTestId("online-manual-join").click();
  await expect(guest.getByTestId("online-error")).toContainText("isn't a connection code");
  await connectByHand(host, guest);
  await chatBothWays(host, guest);
});

/** A small deterministic random source (tests/e2e/monkey.spec.ts). */
function randomSource(seed: number): (n: number) => number {
  let s = seed >>> 0 || 1;
  return (n) => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) % n;
  };
}

/** Both players ready with the decks their settings chose: the game starts on both screens. */
async function readyBoth(host: Page, guest: Page): Promise<void> {
  await expect(guest.getByTestId("online-ready")).toBeEnabled({ timeout: 30_000 });
  await guest.getByTestId("online-ready").click();
  await expect(host.getByTestId("online-opponent")).toHaveAttribute("data-ready", "yes");
  await expect(host.getByTestId("online-ready")).toBeEnabled({ timeout: 30_000 });
  await host.getByTestId("online-ready").click();
  for (const page of [host, guest]) await expect(page.locator(".sve-table")).toBeVisible({ timeout: 30_000 });
}

/**
 * Page errors and error messages of the console, to be none. A public relay that can't be reached is not one: the browser
 * says so in the console, and the program uses the others (docs/online.md "公共服务").
 */
function watchProblems(pages: Page[], problems: string[]): void {
  for (const page of pages) {
    page.on("pageerror", (e) => problems.push(`page error: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error" && !/^WebSocket connection to 'wss:\/\/[^']+' failed/.test(m.text())) problems.push(`console: ${m.text()}`);
    });
  }
}

/**
 * Each person answers their own decisions at random, the way a person does, until `answers` answers, the end, or nothing to
 * answer on either side for a while. Nothing may go wrong (a page error, an error message, the two games differing).
 */
async function playAtRandom(host: Page, guest: Page, answers: number, problems: string[], seed = 7): Promise<number> {
  const pick = randomSource(seed);
  let done = 0;
  let idle = 0;
  for (let round = 0; round < 4000 && done < answers && idle < 80; round++) {
    let acted = false;
    for (const page of [host, guest]) {
      const bar = page.locator(".sve-decision");
      const kind = (await bar.getAttribute("data-decision"))!;
      if (kind === "over" || kind === "waiting" || (await bar.getAttribute("class"))!.includes("sve-busy")) continue;
      if (kind === "announcement") {
        await answer(page, kind, pick);
        acted = true;
        continue;
      }
      const inputs = await bar.getAttribute("data-inputs");
      const did = await answer(page, kind, pick);
      done++;
      acted = true;
      const toast = page.locator(".sve-toast");
      await expect
        .poll(async () => (await bar.getAttribute("data-inputs")) !== inputs || (await toast.count()) > 0, { intervals: [10, 20, 50] })
        .toBe(true);
      if ((await toast.count()) > 0) problems.push(`error message after ${kind} (${did}): ${await toast.first().innerText()}`);
      expect(problems).toEqual([]);
    }
    for (const page of [host, guest]) expect(await page.getByTestId("game-desync").count()).toBe(0);
    if ((await host.locator(".sve-decision").getAttribute("data-decision")) === "over") break;
    idle = acted ? 0 : idle + 1;
    if (!acted) await host.waitForTimeout(30);
  }
  return done;
}

/** Both programs played the same game: the same number of inputs once both wait. */
async function expectSameInputs(host: Page, guest: Page): Promise<void> {
  await expect
    .poll(async () => {
      const counts = await Promise.all([host, guest].map((p) => p.locator(".sve-decision").getAttribute("data-inputs")));
      return counts[0] === counts[1];
    })
    .toBe(true);
}

/**
 * Every data channel the page makes (codes by hand: the host's), to cut the connection the way a network would. (A script
 * as text: the tests are type-checked without the browser's types.)
 */
async function recordChannels(page: Page): Promise<void> {
  await page.addInitScript({
    content: `(() => {
      window.sveChannels = [];
      const make = RTCPeerConnection.prototype.createDataChannel;
      RTCPeerConnection.prototype.createDataChannel = function (...args) {
        const channel = make.apply(this, args);
        window.sveChannels.push(channel);
        return channel;
      };
    })();`,
  });
}

test("two programs play a game: the host's rules, both decks ready, answers both ways, a concession, another game", async ({ browser }) => {
  test.setTimeout(300_000);
  const problems: string[] = [];
  const settings = { botDelayMs: 0 };
  const host = await openOnline(browser, { ...settings, setupDecks: ["samples/sd01.json", "samples/sd02.json"] });
  const guest = await openOnline(browser, { ...settings, setupDecks: ["samples/sd03.json", "samples/sd02.json"] });
  watchProblems([host, guest], problems);
  await connectByHand(host, guest);

  // The host sets the rules; the guest sees them, and its deck is checked under them.
  await host.getByTestId("online-turn-order").selectOption("player1");
  await expect(guest.getByTestId("online-rules")).toHaveText("Standard · restriction list: None · first player: Player 1 goes first");
  await expect(guest.getByTestId("online-opponent")).toHaveText("Choosing a deck…");
  await readyBoth(host, guest);

  // Each sees their own seat: the host is player 1 (its deck), the guest player 2.
  await expect(host.getByTestId("game-online")).toHaveAttribute("data-connected", "yes");
  await expect(guest.getByTestId("game-online")).toHaveAttribute("data-connected", "yes");
  await playAtRandom(host, guest, 60, problems);
  await expectSameInputs(host, guest);

  // A chat line in the game: the other side is told there is a new message.
  await host.getByTestId("sidebar-show").click();
  await host.getByTestId("tab-chat").click();
  await host.getByTestId("online-chat-input").fill("good luck");
  await host.getByTestId("online-send").click();
  await expect(guest.getByTestId("game-unread")).toHaveText("New messages: 1");
  await guest.getByTestId("game-unread").click();
  await expect(guest.getByTestId("online-chat")).toContainText("good luck");

  // The guest concedes (unless the game is over already): both see the same end.
  if ((await guest.locator(".sve-decision").getAttribute("data-decision")) !== "over") {
    guest.once("dialog", (dialog) => void dialog.accept());
    await guest.getByTestId("game-concede").click();
    await expect(guest.locator(".sve-result-panel h2")).toHaveText("Defeat");
    await expect(host.locator(".sve-result-panel h2")).toHaveText("Victory");
  }
  for (const page of [host, guest]) await expect(page.getByTestId("result-new-game")).toHaveText("Another game");

  // Another game with the same player: back to the preparation, ready again.
  await host.getByTestId("result-new-game").click();
  await guest.getByTestId("result-new-game").click();
  for (const page of [host, guest]) await expect(page.getByTestId("online-prep")).toBeVisible();
  await readyBoth(host, guest);
  await playAtRandom(host, guest, 6, problems);
  expect(problems).toEqual([]);

  // Leaving a game in progress concedes it (after asking).
  host.once("dialog", (dialog) => void dialog.accept());
  await host.getByTestId("game-menu").click();
  await host.getByTestId("menu-online").click();
  await host.getByTestId("online-leave").click();
  await expect(guest.locator(".sve-result-panel h2")).toHaveText("Victory");
  await expect(guest.getByTestId("game-online")).toHaveAttribute("data-connected", "no");
});

test("a lost connection: the game waits, the two programs connect again, and it goes on where it was", async ({ browser }) => {
  test.setTimeout(300_000);
  const problems: string[] = [];
  const settings = { botDelayMs: 0 };
  const host = await openOnline(browser, { ...settings, setupDecks: ["samples/sd02.json", "samples/sd01.json"] }, recordChannels);
  const guest = await openOnline(browser, { ...settings, setupDecks: ["samples/sd07.json", "samples/sd01.json"] });
  watchProblems([host, guest], problems);
  await connectByHand(host, guest);
  await readyBoth(host, guest);
  await playAtRandom(host, guest, 16, problems, 11);

  // The network drops: both are told, and the game waits (each can still answer its own decisions meanwhile).
  await host.evaluate("window.sveChannels.forEach((channel) => channel.close())");
  for (const page of [host, guest]) await expect(page.getByTestId("game-online")).toHaveAttribute("data-connected", "no");
  const meanwhile = await playAtRandom(host, guest, 3, problems, 12);
  const inputs = async (page: Page) => Number(await page.locator(".sve-decision").getAttribute("data-inputs"));
  const before = await inputs(host);

  // Both connect again (codes by hand once more): the answers the other side missed are sent again, and the game goes on.
  for (const page of [host, guest]) {
    await page.getByTestId("game-reconnect").click();
    await expect(page.getByTestId("online-closed")).toBeVisible();
  }
  await connectByHand(host, guest);
  for (const page of [host, guest]) {
    await expect(page.getByTestId("online-game")).toBeVisible();
    await page.getByTestId("online-to-game").click();
    await expect(page.getByTestId("game-online")).toHaveAttribute("data-connected", "yes");
  }
  const after = await playAtRandom(host, guest, 30, problems, 13);
  await expectSameInputs(host, guest);
  // It went on (unless it ended): the answers given while cut off reached the other side.
  if ((await host.locator(".sve-decision").getAttribute("data-decision")) !== "over") expect(after).toBe(30);
  expect(await inputs(host)).toBeGreaterThan(before);
  console.log(`answers while cut off: ${meanwhile}; after reconnecting: ${after}`);
  expect(problems).toEqual([]);
});

/**
 * Programs in one browser context that meet on the tests' local network (net/local-network.ts: a BroadcastChannel instead
 * of the public relays), each page one program.
 */
async function localRoom(browser: Browser, settings: Record<string, unknown>) {
  const context = await browser.newContext();
  await context.addInitScript({ content: `localStorage.setItem("sve-test-network", "local");` });
  return async (): Promise<Page> => {
    const page = await context.newPage();
    await useSettings(page, { uiLang: "en", ...settings });
    await page.goto("/");
    await expect(page.getByTestId("menu-online")).toBeEnabled({ timeout: 120_000 });
    await page.getByTestId("menu-online").click();
    await expect(page.getByTestId("online")).toHaveAttribute("data-phase", "idle");
    return page;
  };
}

/** A spectator's seat in room `code`. */
async function watchRoom(page: Page, code: string): Promise<void> {
  await page.getByTestId("online-code").fill(code);
  await page.getByTestId("online-watch").click();
}

/** The cards of a player's hand on a page's table, and how many of them show their faces. */
async function handFaces(page: Page, seat: 0 | 1): Promise<{ cards: number; faces: number }> {
  const cards = await page.locator(`[data-zone="${seat}:hand"] [data-card]`).count();
  const backs = await page.locator(`[data-zone="${seat}:hand"] [data-card][data-hidden="true"]`).count();
  return { cards, faces: cards - backs };
}

test("a room's games can be watched: spectators follow the game from its start or its middle, see no hand, can't chat", async ({ browser }) => {
  test.setTimeout(300_000);
  const problems: string[] = [];
  const open = await localRoom(browser, { botDelayMs: 0, setupDecks: ["samples/sd04.json", "samples/sd02.json"] });
  const host = await open();
  const early = await open();
  const guest = await open();
  watchProblems([host, early, guest], problems);
  await host.getByTestId("online-host").click();
  const code = (await host.getByTestId("online-room-code").innerText()).trim();

  // A spectator who comes before the other player waits for them.
  await watchRoom(early, code);
  await expect(early.getByTestId("online-searching")).toContainText(`room ${code} to watch`);
  await guest.getByTestId("online-code").fill(code);
  await guest.getByTestId("online-join").click();
  for (const page of [host, guest]) await expect(page.getByTestId("online-connected")).toBeVisible({ timeout: 30_000 });
  await expect(host.getByTestId("online-via")).toHaveText("the tests' channel in this browser");
  await expect(early.getByTestId("online-watching")).toBeVisible({ timeout: 30_000 });
  await expect(early.getByTestId("online-watch-waiting")).toBeVisible();
  for (const page of [host, guest, early]) await expect(page.getByTestId("online-watchers")).toHaveAttribute("data-n", "1");

  // The spectator reads the players' chat (whose line it is), and writes nothing.
  await host.getByTestId("online-chat-input").fill("welcome");
  await host.getByTestId("online-send").click();
  await guest.getByTestId("online-chat-input").fill("hi");
  await guest.getByTestId("online-send").click();
  await expect(early.getByTestId("online-chat")).toContainText("Player 1: welcome");
  await expect(early.getByTestId("online-chat")).toContainText("Player 2: hi");
  await expect(early.getByTestId("online-chat-input")).toHaveCount(0);
  await expect(early.getByTestId("online-chat-readonly")).toBeVisible();

  // The game starts: the spectator's screen shows it by itself, with nothing to do but swap sides.
  await readyBoth(host, guest);
  await expect(early.locator(".sve-table")).toBeVisible({ timeout: 30_000 });
  await expect(early.getByTestId("game-online")).toContainText("Watching");
  await expect(early.getByTestId("game-swap-sides")).toBeVisible();
  await expect(early.getByTestId("game-concede")).toHaveCount(0);
  await playAtRandom(host, guest, 30, problems);

  // One more spectator comes in the middle of the game: it gets the game so far. A third is turned away.
  const late = await open();
  watchProblems([late], problems);
  await watchRoom(late, code);
  await expect(late.locator(".sve-table")).toBeVisible({ timeout: 30_000 });
  const third = await open();
  await watchRoom(third, code);
  await expect(third.getByTestId("online-closed")).toHaveText("That room's spectator seats are taken (2 at most).", { timeout: 30_000 });
  await playAtRandom(host, guest, 20, problems, 9);

  // All four follow the same game; the spectators see no card of either hand.
  await expect
    .poll(async () => {
      const counts = await Promise.all([host, guest, early, late].map((p) => p.locator(".sve-decision").getAttribute("data-inputs")));
      return new Set(counts).size;
    })
    .toBe(1);
  for (const page of [early, late]) {
    for (const seat of [0, 1] as const) {
      const hand = await handFaces(page, seat);
      expect(hand.faces).toBe(0);
    }
    expect(await page.getByTestId("game-desync").count()).toBe(0);
  }
  // Swapping sides: player 2's side at the bottom.
  await expect(early.locator(".sve-hand-own")).toHaveAttribute("data-zone", "0:hand");
  await early.getByTestId("game-swap-sides").click();
  await expect(early.locator(".sve-hand-own")).toHaveAttribute("data-zone", "1:hand");

  // The host leaves (conceding): the spectators see the end, and go back to the room from there.
  if ((await host.locator(".sve-decision").getAttribute("data-decision")) !== "over") {
    host.once("dialog", (dialog) => void dialog.accept());
    await host.getByTestId("game-menu").click();
    await host.getByTestId("menu-online").click();
    await host.getByTestId("online-leave").click();
    await expect(guest.locator(".sve-result-panel h2")).toHaveText("Victory");
  }
  for (const page of [early, late]) await expect(page.getByTestId("result-new-game")).toHaveText("Back to the room");
  expect(problems).toEqual([]);
});

test("two programs meet in a room through the public relays", async ({ browser }) => {
  test.skip(!process.env.SVE_E2E_ONLINE, "needs the internet: SVE_E2E_ONLINE=1");
  test.setTimeout(180_000);
  const host = await openOnline(browser);
  const guest = await openOnline(browser);
  await host.getByTestId("online-host").click();
  const code = (await host.getByTestId("online-room-code").innerText()).trim();
  expect(code).toMatch(/^[A-Z2-9]{6}$/);
  await guest.getByTestId("online-code").fill(code.toLowerCase());
  const started = Date.now();
  await guest.getByTestId("online-join").click();
  // Both use the network the host selected.
  await expect(guest.getByTestId("online-via")).toBeVisible({ timeout: 120_000 });
  const via = await guest.getByTestId("online-via").innerText();
  await expect(host.getByTestId("online-via")).toHaveText(via);
  console.log(`connected via ${via} in ${Math.round((Date.now() - started) / 1000)} s`);
  await expect(host.getByTestId("online-same")).toHaveText("Both programs are the same version (cards, rules, restriction lists).");
  await chatBothWays(host, guest);
});

test("a game in a room: the connection drops, both reconnect to the same room, and the game goes on", async ({ browser }) => {
  test.skip(!process.env.SVE_E2E_ONLINE, "needs the internet: SVE_E2E_ONLINE=1");
  test.setTimeout(300_000);
  const problems: string[] = [];
  const settings = { botDelayMs: 0 };
  const host = await openOnline(browser, { ...settings, setupDecks: ["samples/sd05.json", "samples/sd01.json"] }, recordChannels);
  const guest = await openOnline(browser, { ...settings, setupDecks: ["samples/sd06.json", "samples/sd01.json"] }, recordChannels);
  watchProblems([host, guest], problems);
  await host.getByTestId("online-host").click();
  const code = (await host.getByTestId("online-room-code").innerText()).trim();
  await guest.getByTestId("online-code").fill(code);
  await guest.getByTestId("online-join").click();
  for (const page of [host, guest]) await expect(page.getByTestId("online-connected")).toBeVisible({ timeout: 120_000 });
  await readyBoth(host, guest);
  await playAtRandom(host, guest, 12, problems, 21);

  // The network drops (every channel of both pages): each finds out, from the channel or from pings no longer answered.
  for (const page of [host, guest]) await page.evaluate("window.sveChannels.forEach((channel) => channel.close())");
  for (const page of [host, guest]) await expect(page.getByTestId("game-online")).toHaveAttribute("data-connected", "no", { timeout: 60_000 });
  const before = Number(await host.locator(".sve-decision").getAttribute("data-inputs"));
  for (const page of [host, guest]) {
    await page.getByTestId("game-reconnect").click();
    await expect(page.getByTestId("online-reconnect")).toHaveText(`Reconnect (room ${code})`);
    await page.getByTestId("online-reconnect").click();
  }
  for (const page of [host, guest]) {
    await expect(page.getByTestId("online-game")).toBeVisible({ timeout: 120_000 });
    await page.getByTestId("online-to-game").click();
  }
  await playAtRandom(host, guest, 12, problems, 22);
  await expectSameInputs(host, guest);
  expect(Number(await host.locator(".sve-decision").getAttribute("data-inputs"))).toBeGreaterThan(before);
  expect(problems).toEqual([]);
});

test("a spectator watches a game in a room through the public relays", async ({ browser }) => {
  test.skip(!process.env.SVE_E2E_ONLINE, "needs the internet: SVE_E2E_ONLINE=1");
  test.setTimeout(300_000);
  const problems: string[] = [];
  const settings = { botDelayMs: 0 };
  const host = await openOnline(browser, { ...settings, setupDecks: ["samples/sd03.json", "samples/sd01.json"] });
  const guest = await openOnline(browser, { ...settings, setupDecks: ["samples/sd08.json", "samples/sd01.json"] });
  const spectator = await openOnline(browser, settings);
  watchProblems([host, guest, spectator], problems);
  await host.getByTestId("online-host").click();
  const code = (await host.getByTestId("online-room-code").innerText()).trim();
  await guest.getByTestId("online-code").fill(code);
  await guest.getByTestId("online-join").click();
  for (const page of [host, guest]) await expect(page.getByTestId("online-connected")).toBeVisible({ timeout: 120_000 });
  await spectator.getByTestId("online-code").fill(code);
  await spectator.getByTestId("online-watch").click();
  await expect(spectator.getByTestId("online-watching")).toBeVisible({ timeout: 120_000 });
  await expect(host.getByTestId("online-watchers")).toHaveAttribute("data-n", "1");
  await readyBoth(host, guest);
  await expect(spectator.locator(".sve-table")).toBeVisible({ timeout: 60_000 });
  await playAtRandom(host, guest, 20, problems, 31);
  await expect
    .poll(async () => {
      const counts = await Promise.all([host, guest, spectator].map((p) => p.locator(".sve-decision").getAttribute("data-inputs")));
      return new Set(counts).size;
    }, { timeout: 30_000 })
    .toBe(1);
  expect(problems).toEqual([]);
});
