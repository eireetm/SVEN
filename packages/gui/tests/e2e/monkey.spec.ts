import { expect, test, type Locator, type Page } from "@playwright/test";
import { startGame } from "./helpers";

// A person who clicks at random: every decision is answered through the decision bar with random choices, against the
// random bot. Nothing may go wrong on the page (no page error, no error message, no decision the bar cannot answer), and
// every game must end. SVE_MONKEY_GAMES=n plays more games (the deck pairs repeat with other seeds).
const PAIRS: readonly [string, string][] = [
  ["sd03", "sd07"], // Runecraft (spellchain, ordering the deck), Abysscraft
  ["csd01", "csd03a"], // Umamusume (race zone), Vanguard (drive checks, ride)
  ["pcs01", "csd02a"], // Princess Connect (UB, equipment), Cinderella Girls (magical items, Lesson)
];
const GAMES = Number(process.env.SVE_MONKEY_GAMES ?? PAIRS.length);
const MAX_ANSWERS = 600;

/** A small deterministic random source, so a failing run can be repeated. */
function randomSource(seed: number): (n: number) => number {
  let s = seed >>> 0 || 1;
  return (n) => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) % n;
  };
}

async function randomAnswer(page: Page, bar: Locator, kind: string, pick: (n: number) => number): Promise<void> {
  const body = bar.locator(".sve-decision-body");
  const confirm = body.getByRole("button", { name: /^Confirm$/ });
  if (kind === "selectCards") {
    const cards = body.locator(".sve-choice-cards .sve-card");
    const n = await cards.count();
    if ((await confirm.count()) === 0) return cards.nth(pick(n)).click(); // one card: a click answers
    for (let i = 0; i < n; i++) if (pick(2) === 0) await cards.nth(i).click();
    const none = body.getByRole("button", { name: /^Select none$/ });
    if (!(await confirm.isEnabled()) && (await none.count()) > 0) return none.click();
    for (let i = 0; i < n && !(await confirm.isEnabled()); i++) {
      if (!(await cards.nth(i).getAttribute("class"))!.includes("sve-card-selected")) await cards.nth(i).click();
    }
    // Too many chosen: take the choices back one by one.
    for (let i = n - 1; i >= 0 && !(await confirm.isEnabled()); i--) {
      if ((await cards.nth(i).getAttribute("class"))!.includes("sve-card-selected")) await cards.nth(i).click();
    }
    return confirm.click();
  }
  const boxes = body.locator("input[type=checkbox]");
  if (kind === "choose" && (await boxes.count()) > 0) {
    const n = await boxes.count();
    for (let i = 0; i < n; i++) if (pick(3) > 0 && (await boxes.nth(i).isEnabled())) await boxes.nth(i).check();
    for (let i = 0; i < n && !(await confirm.isEnabled()); i++) if (await boxes.nth(i).isEnabled()) await boxes.nth(i).check();
    return confirm.click();
  }
  if (kind === "orderCards") {
    const moves = body.locator(".sve-order-buttons button:not([disabled])");
    const n = await moves.count();
    if (n > 0) await moves.nth(pick(n)).click();
    return confirm.click();
  }
  const buttons = body.locator("button:not([disabled])");
  const n = await buttons.count();
  expect(n, `no button to answer ${kind}`).toBeGreaterThan(0);
  if (kind === "mainPhase") {
    // End the main phase now and then, else take a random action (the end button is the last one).
    return pick(5) === 0 || n === 1 ? body.getByRole("button", { name: /^End main phase$/ }).click() : buttons.nth(pick(n - 1)).click();
  }
  return buttons.nth(pick(n)).click();
}

for (let game = 0; game < GAMES; game++) {
  const [a, b] = PAIRS[game % PAIRS.length]!;
  test(`random clicks: ${a} (person) against ${b} (random bot), game ${game + 1}`, async ({ page }) => {
    const problems: string[] = [];
    page.on("pageerror", (e) => problems.push(`page error: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") problems.push(`console: ${m.text()}`);
    });
    const settings = { botDelayMs: 0, setupControllers: ["human", "random"], setupDecks: [`samples/${a}.json`, `samples/${b}.json`] };
    await page.addInitScript((value) => localStorage.setItem("sve-gui-settings", value), JSON.stringify(settings));
    await startGame(page, `monkey-${game}`);
    const bar = page.locator(".sve-decision");
    const pick = randomSource(game + 1);
    let answers = 0;
    while (answers < MAX_ANSWERS) {
      const kind = (await bar.getAttribute("data-decision"))!;
      if (kind === "over") break;
      if (kind === "waiting" || (await bar.getAttribute("class"))!.includes("sve-busy")) {
        await page.waitForTimeout(20);
        continue;
      }
      const inputs = await bar.getAttribute("data-inputs");
      await randomAnswer(page, bar, kind, pick);
      answers++;
      // The answer lands (the input count moves on) or is refused (an error message).
      const toast = page.locator(".sve-toast");
      await expect
        .poll(async () => (await bar.getAttribute("data-inputs")) !== inputs || (await toast.count()) > 0, { intervals: [10, 20, 50] })
        .toBe(true);
      if ((await toast.count()) > 0) problems.push(`error message after ${kind}: ${await toast.first().innerText()}`);
      expect(problems).toEqual([]);
    }
    await expect(bar).toHaveAttribute("data-decision", "over");
    expect(problems).toEqual([]);
  });
}
