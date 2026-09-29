import { expect, test } from "@playwright/test";
import { answer, startGame } from "./helpers";

// A person who clicks at random: every decision is answered with random choices the way a person does (lit cards and their
// menus, piles, the buttons beside the mats, the decision window), against the random bot. Nothing may go wrong on the page (no page error, no error message, no decision the bar cannot answer), and
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
      const did = await answer(page, kind, pick);
      answers++;
      // The answer lands (the input count moves on) or is refused (an error message).
      const toast = page.locator(".sve-toast");
      await expect
        .poll(async () => (await bar.getAttribute("data-inputs")) !== inputs || (await toast.count()) > 0, { intervals: [10, 20, 50] })
        .toBe(true);
      if ((await toast.count()) > 0) problems.push(`error message after ${kind} (${did}): ${await toast.first().innerText()}`);
      expect(problems).toEqual([]);
    }
    await expect(bar).toHaveAttribute("data-decision", "over");
    expect(problems).toEqual([]);
  });
}
