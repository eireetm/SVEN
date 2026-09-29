import { expect, test, type Page } from "@playwright/test";
import { answer, clickCard, startGame, useSettings } from "./helpers";

// What happened reads on the table without the log: a played card shows in its player's corner once it has landed, an
// attack's red arrow stands before its combat (the host shows the attack a moment), and the cards an effect selects get a
// blue arrow from their source.

const SIGNS = {
  own: ".sve-showcase-own",
  opponent: ".sve-showcase-opponent",
  attack: ".sve-arrow-attack:not(.sve-arrow-flash)",
  target: ".sve-arrow-target.sve-arrow-flash",
} as const;

/** Look at the table for `ms`: which signs show (an attack's arrow only while the game waits before its combat). */
async function look(page: Page, ms: number, seen: Set<string>): Promise<void> {
  const bar = page.locator(".sve-decision");
  const until = Date.now() + ms;
  while (Date.now() < until) {
    for (const [name, selector] of Object.entries(SIGNS)) {
      if (seen.has(name) || (await page.locator(selector).count()) === 0) continue;
      if (name === "attack") {
        // Nobody is asked anything while the attack stands (a person with a Quick card would be: not this game).
        if ((await bar.getAttribute("data-decision")) !== "waiting") continue;
      }
      seen.add(name);
    }
    await page.waitForTimeout(30);
  }
}

test("played cards show in their corners, attacks show red arrows before their combat, effects blue arrows to their targets", async ({ page }) => {
  test.setTimeout(180_000);
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(e.message));
  await useSettings(page, {
    uiLang: "en",
    botDelayMs: 300,
    setupControllers: ["human", "greedy"],
    setupDecks: ["samples/sd03.json", "samples/sd01.json"],
    setupTurnOrder: "player1",
  });
  await startGame(page, "anim-3");
  const bar = page.locator(".sve-decision");
  const seen = new Set<string>();
  for (let i = 0; i < 300 && seen.size < 4; i++) {
    const kind = (await bar.getAttribute("data-decision"))!;
    if (kind === "over") break;
    if (kind === "waiting" || (await bar.getAttribute("class"))!.includes("sve-busy")) {
      await look(page, 120, seen);
      continue;
    }
    // Play the first card that can act (its first action), else the simplest answer.
    const lit = page.locator(".sve-table .sve-card-action");
    if (kind === "mainPhase" && (await lit.count()) > 0) {
      await clickCard(lit.first());
      const items = page.getByTestId("card-menu").getByRole("menuitem");
      if ((await items.count()) > 0) await items.first().click();
      else {
        await page.keyboard.press("Escape");
        await answer(page, kind);
      }
    } else await answer(page, kind);
    await look(page, 700, seen);
  }
  expect([...seen].sort()).toEqual(["attack", "opponent", "own", "target"]);
  // They are short: nothing stays in the corners.
  await expect(page.locator(".sve-showcase")).toHaveCount(0, { timeout: 3000 });
  expect(problems).toEqual([]);
});
