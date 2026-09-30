import { expect, type Locator, type Page } from "@playwright/test";

// Shared steps of the end-to-end tests: settings before the page loads, the way from the main menu into a game, and
// answering decisions the way a person does: on the table (lit cards and their menus, the buttons beside the mats) or in
// the decision window.
export const SETTINGS_KEY = "sve-gui-settings";

/** Settings the page starts with (the app reads them from localStorage). */
export async function useSettings(page: Page, settings: Record<string, unknown>): Promise<void> {
  await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [SETTINGS_KEY, JSON.stringify(settings)] as const);
}

/** From the main menu to the "Play vs AI" setup, once the engine has started. */
export async function openSetup(page: Page): Promise<void> {
  await page.goto("/");
  const play = page.getByTestId("menu-play");
  await expect(play).toBeEnabled({ timeout: 120_000 });
  await play.click();
  await expect(page.getByTestId("start-game")).toBeEnabled({ timeout: 60_000 });
}

/** Start a game from the setup (with a fixed seed when given). */
export async function startGame(page: Page, seed?: string): Promise<void> {
  await openSetup(page);
  if (seed !== undefined) {
    await page.locator(".sve-advanced summary").click();
    await page.getByTestId("setup-seed").fill(seed);
  }
  await page.getByTestId("start-game").click();
  await expect(page.locator(".sve-table")).toBeVisible();
}

/** The log and debug sidebar: hidden in a game until shown. */
export async function showSidebar(page: Page): Promise<void> {
  const show = page.getByTestId("sidebar-show");
  if ((await show.count()) > 0) await show.click();
  await expect(page.getByTestId("game-sidebar")).toBeVisible();
}

/**
 * Click a card on the table on its left side, halfway down: the cards of a hand overlap to the right and lean a little
 * (their corners stick out of the box a click is measured from), and the card under the pointer rises.
 */
export async function clickCard(card: Locator): Promise<void> {
  const box = (await card.boundingBox())!;
  await card.click({ position: { x: Math.min(14, box.width / 3), y: box.height / 2 } });
}

/** A button beside the mats, when it is there and enabled. */
async function tableButton(page: Page, id: string): Promise<Locator | null> {
  const button = page.getByTestId(`table-${id}`);
  return (await button.count()) > 0 && (await button.isEnabled()) ? button : null;
}

/** The decision window's body, when the pending decision is answered in it. */
export async function dialogBody(page: Page): Promise<Locator | null> {
  const dialog = page.getByTestId("decision-dialog");
  return (await dialog.count()) > 0 ? dialog.locator(".sve-decision-body") : null;
}

/**
 * A Quick card or ability resolved and the game waits until it has been seen (board/QuickAnnouncement.tsx): OK, then wait
 * until that announcement is gone (the next one may follow at once).
 */
export async function acknowledge(page: Page): Promise<void> {
  const bar = page.locator(".sve-decision");
  const seq = await bar.getAttribute("data-announcement");
  await page.getByTestId("announcement-ok").click();
  if (seq !== null) await expect(bar).not.toHaveAttribute("data-announcement", seq);
}

/** A random source: n -> 0..n-1. */
export type Pick = (n: number) => number;

/**
 * Answer the pending decision: with `pick`, at random (any action, any choice); without, the simplest way (end the main
 * phase, pass, keep the hand, the first card or option). Returns what was done, for the failure messages.
 */
export async function answer(page: Page, kind: string, pick?: Pick): Promise<string> {
  const choose = (n: number) => (pick ? pick(n) : 0);
  if (kind === "announcement") return (await acknowledge(page), "OK");
  const click = async (id: string) => {
    const button = await tableButton(page, id);
    if (button) await button.click();
    return id;
  };
  const body = await dialogBody(page);
  if (body) return answerInDialog(body, kind, choose, !!pick);
  switch (kind) {
    case "chooseTurnOrder":
      return click(choose(2) === 0 ? "first" : "second");
    case "mulligan": {
      if (choose(3) !== 0) return click("keep");
      // CR 6.2.1.8: redrawing asks the order the hand goes to the bottom of the deck in (moved about at random when picking).
      await click("redraw");
      const moves = page.locator("[data-testid=card-order] .sve-order-buttons button:not([disabled])");
      if (pick) for (let i = pick(3); i > 0; i--) await moves.nth(pick(await moves.count())).click();
      await page.getByTestId("mulligan-redraw").click();
      return "redraw";
    }
    case "mainPhase":
    case "quick":
      return pick ? useTable(page, kind, pick) : click(kind === "mainPhase" ? "end" : "pass");
    case "selectCards":
      return selectOnTable(page, choose);
  }
  throw new Error(`no way to answer ${kind} on the table`);
}

/** A random action of the main phase or quick timing: a lit card (or pile) and one of its menu's items, else end / pass. */
async function useTable(page: Page, kind: string, pick: Pick): Promise<string> {
  const end = kind === "mainPhase" ? "end" : "pass";
  const lit = page.locator(".sve-table .sve-card-action, .sve-table .sve-pile-action");
  const n = await lit.count();
  if (n === 0 || pick(5) === 0) return (await (await tableButton(page, end))?.click(), end);
  const target = lit.nth(pick(n));
  if ((await target.getAttribute("class"))!.includes("sve-pile-action")) {
    await target.click();
    const cards = page.locator(".sve-modal .sve-zone-action");
    if ((await cards.count()) === 0) return (await page.keyboard.press("Escape"), "an empty pile");
    await cards.nth(pick(await cards.count())).click();
  } else await clickCard(target);
  const items = page.getByTestId("card-menu").getByRole("menuitem");
  if ((await items.count()) === 0) {
    await page.keyboard.press("Escape");
    return (await (await tableButton(page, end))?.click(), end);
  }
  const item = items.nth(pick(await items.count()));
  const text = await item.innerText();
  await item.click();
  return `menu: ${text}`;
}

/** Choose cards on the table: the lit candidates, then confirm (a single card is chosen by its click). */
async function selectOnTable(page: Page, choose: (n: number) => number): Promise<string> {
  const candidates = page.locator(".sve-table .sve-card-candidate, .sve-table .sve-card-selected");
  const n = await candidates.count();
  const confirm = page.getByTestId("table-confirm");
  if ((await confirm.count()) === 0) {
    if (n === 0) throw new Error("a selection with nothing to click");
    await clickCard(candidates.nth(choose(n)));
    return "a card";
  }
  const none = await tableButton(page, "none");
  if (none && choose(3) === 0) return (await none.click(), "none");
  for (let i = 0; i < n && !(await confirm.isEnabled()); i++) await clickCard(page.locator(".sve-table .sve-card-candidate").first());
  if (await confirm.isEnabled()) return (await confirm.click(), "confirm");
  if (none) return (await none.click(), "none");
  throw new Error("a selection that can't be confirmed");
}

/** The decision window: its cards, options and buttons. */
async function answerInDialog(body: Locator, kind: string, choose: (n: number) => number, random: boolean): Promise<string> {
  const confirm = body.getByRole("button", { name: /^(Confirm|确定)$/ });
  if (kind === "selectCards") {
    const cards = body.locator(".sve-choice-cards .sve-card");
    const n = await cards.count();
    if ((await confirm.count()) === 0) return (await cards.nth(choose(n)).click(), "a card");
    const none = body.getByRole("button", { name: /^(Select none|不选)$/ });
    if (random) for (let i = 0; i < n; i++) if (choose(2) === 0) await cards.nth(i).click();
    for (let i = 0; i < n && !(await confirm.isEnabled()); i++) {
      if (!(await cards.nth(i).getAttribute("class"))!.includes("sve-card-selected")) await cards.nth(i).click();
    }
    // Too many chosen: take the choices back one by one.
    for (let i = n - 1; i >= 0 && !(await confirm.isEnabled()); i--) {
      if ((await cards.nth(i).getAttribute("class"))!.includes("sve-card-selected")) await cards.nth(i).click();
    }
    if (await confirm.isEnabled()) return (await confirm.click(), "confirm");
    return (await none.click(), "none");
  }
  const boxes = body.locator("input[type=checkbox]");
  if (kind === "choose" && (await boxes.count()) > 0) {
    const n = await boxes.count();
    if (random) for (let i = 0; i < n; i++) if (choose(3) > 0 && (await boxes.nth(i).isEnabled())) await boxes.nth(i).check();
    for (let i = 0; i < n && !(await confirm.isEnabled()); i++) if (await boxes.nth(i).isEnabled()) await boxes.nth(i).check();
    return (await confirm.click(), "options");
  }
  if (kind === "orderCards") {
    const moves = body.locator(".sve-order-buttons button:not([disabled])");
    const n = await moves.count();
    if (random && n > 0) await moves.nth(choose(n)).click();
    return (await confirm.click(), "order");
  }
  // The hand's order for a redraw (left open by an earlier step): redraw as it is.
  if (kind === "mulligan") return (await body.getByTestId("mulligan-redraw").click(), "redraw");
  const buttons = body.locator("button:not([disabled])");
  const n = await buttons.count();
  expect(n, `no button to answer ${kind}`).toBeGreaterThan(0);
  const button = buttons.nth(choose(n));
  const text = await button.innerText();
  await button.click();
  return text;
}
