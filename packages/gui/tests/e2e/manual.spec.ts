import { expect, test, type Page } from "@playwright/test";
import { answer, clickCard, startGame, useSettings } from "./helpers";

// Manual debugging: at a main phase decision a click on a deck, a card, a leader or a player's panel opens what can be done
// by hand, the legal actions apart from the illegal ones; each operation goes through the engine and into the log.

async function toMainPhase(page: Page): Promise<void> {
  for (let i = 0; i < 40; i++) {
    const kind = (await page.locator(".sve-decision").getAttribute("data-decision"))!;
    if (kind === "mainPhase") return;
    if (kind !== "waiting") await answer(page, kind);
    await page.waitForTimeout(100);
  }
  throw new Error("no main phase");
}

const handCount = (page: Page) => page.locator(".sve-hand-own .sve-card").count();

test("by hand: draw, put a card onto the field, attack with it at once, a leader's defense, play points", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(e.message));
  await useSettings(page, { uiLang: "en", botDelayMs: 0, manualDebug: true, setupControllers: ["human", "greedy"], setupDecks: ["samples/sd01.json", "samples/sd02.json"] });
  await startGame(page, "manual-e2e");
  await toMainPhase(page);
  const dialog = page.getByTestId("manual-dialog");

  // The deck: draw 2.
  const hand = await handCount(page);
  await page.getByTestId("deck-0").click();
  await expect(dialog).toContainText("Illegal");
  await page.getByTestId("manual-draw-value").fill("2");
  await page.getByTestId("manual-draw").click();
  await expect.poll(() => handCount(page)).toBe(hand + 2);
  await page.keyboard.press("Escape");

  // A card of the hand onto the field.
  await clickCard(page.locator(".sve-hand-own .sve-card").first());
  await page.getByTestId("manual-move-field").click();
  const onField = page.locator(".sve-mat-own .sve-field-slot .sve-card");
  await expect(onField).toHaveCount(1);

  // It attacks the enemy leader at once (it only just came onto the field).
  await onField.first().click();
  await dialog.getByTestId("manual-attack").last().click();
  await expect(page.getByTestId("player-panel-1").locator(".sve-player-defense")).not.toHaveText("20");

  // The enemy leader +5, my play points 10/10.
  const defense = Number(await page.getByTestId("player-panel-1").locator(".sve-player-defense").innerText());
  await page.locator(".sve-mat-opponent .sve-leader-card").click();
  await page.getByTestId("manual-defense-5").click();
  await expect(page.getByTestId("player-panel-1").locator(".sve-player-defense")).toHaveText(String(defense + 5));
  await page.keyboard.press("Escape");
  await page.getByTestId("player-panel-0").click();
  await page.getByTestId("manual-playPoints").fill("10");
  await page.getByTestId("manual-maxPlayPoints").fill("10");
  await page.getByTestId("manual-points").click();
  await expect(page.getByTestId("player-panel-0").locator(".sve-player-pp")).toContainText("10/10");
  await page.keyboard.press("Escape");

  // Each is in the log, and undone like any answer.
  await page.getByTestId("sidebar-show").click();
  await expect(page.locator(".sve-log")).toContainText("[By hand]");
  await page.getByRole("button", { name: /^Debug$/ }).click();
  await page.getByRole("button", { name: /^Undo my last answer$/ }).click();
  await expect(page.getByTestId("player-panel-0").locator(".sve-player-pp")).not.toContainText("10/10");

  // Off: a click on the deck does nothing by hand.
  await page.getByTestId("debug-manual").uncheck();
  await page.getByTestId("deck-0").click({ force: true });
  await expect(dialog).toHaveCount(0);
  expect(problems).toEqual([]);
});
