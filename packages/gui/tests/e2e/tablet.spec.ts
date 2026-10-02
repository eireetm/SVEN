import { expect, test, type CDPSession, type Locator, type Page } from "@playwright/test";
import { answer, startGame, useSettings } from "./helpers";

// An Android tablet held sideways: big enough for the wide layout, but used with fingers. Its menus scroll when taller than
// the screen (the settings' last button can be reached), the deck builder adds and removes cards by tapping (no right
// click, no mouse drag and drop) and a long press only reads a card, and a card is dragged from the hand onto the field
// with a finger.
test.use({ viewport: { width: 1138, height: 712 }, deviceScaleFactor: 2.25, hasTouch: true, isMobile: true });

/** A finger moved from one point to another, with the touch events a phone sends (a swipe or a drag). */
async function fingerDrag(page: Page, cdp: CDPSession, from: { x: number; y: number }, to: { x: number; y: number }): Promise<void> {
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [from] });
  for (let i = 1; i <= 20; i++) {
    const point = { x: from.x + ((to.x - from.x) * i) / 20, y: from.y + ((to.y - from.y) * i) / 20 };
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [point] });
    await page.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

/** A finger held on a point longer than a long press waits (long-press.ts). */
async function hold(page: Page, cdp: CDPSession, at: { x: number; y: number }): Promise<void> {
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [at] });
  await page.waitForTimeout(700);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

const middle = async (locator: Locator) => {
  const box = (await locator.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

test("a tablet: the menus scroll, the deck builder works by tapping, a card is dragged onto the field", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(e.message));
  const cdp = await page.context().newCDPSession(page);
  await useSettings(page, { uiLang: "en", botDelayMs: 0, setupDecks: ["samples/sd01.json", "samples/sd02.json"], setupTurnOrder: "player1" });
  await page.goto("/");
  await expect(page.getByTestId("menu-play")).toBeEnabled({ timeout: 120_000 });

  // The settings are taller than the screen: a swipe scrolls them, and their last button can be reached.
  await page.getByTestId("menu-settings").tap();
  const back = page.locator(".sve-settings > button").last();
  const below = (await back.boundingBox())!.y + 20 > 712;
  const start = await middle(page.locator(".sve-settings"));
  await fingerDrag(page, cdp, { x: start.x, y: 600 }, { x: start.x, y: 200 });
  if (below) expect(await page.locator(".sve-menu").evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
  const box = (await back.boundingBox())!;
  expect(box.y + box.height).toBeLessThanOrEqual(712);
  await back.tap();

  // The deck builder: the wide layout (no tabs); a tap adds, a long press only reads, a tap on the deck's card removes it.
  await page.getByTestId("menu-decks").tap();
  await expect(page.getByTestId("builder-pool")).toBeVisible();
  await expect(page.getByTestId("builder-tab-deck")).toHaveCount(0);
  const deckCards = page.locator(".sve-deck-tile");
  await page.locator(".sve-pool-tile").first().tap();
  await expect(deckCards).toHaveCount(1);
  await hold(page, cdp, await middle(page.locator(".sve-pool-tile").nth(1)));
  await page.waitForTimeout(300);
  await expect(deckCards).toHaveCount(1);
  await deckCards.first().tap();
  await expect(deckCards).toHaveCount(0);
  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByTestId("builder-back").tap();

  // A game: a finger drags a card that can be played from the hand onto the field.
  await startGame(page, "tablet");
  const bar = page.locator(".sve-decision");
  const lit = page.locator(".sve-hand-own .sve-card-action");
  for (let step = 0; step < 200 && (await lit.count()) === 0; step++) {
    const kind = (await bar.getAttribute("data-decision"))!;
    if (kind === "waiting" || (await bar.getAttribute("class"))!.includes("sve-busy")) await page.waitForTimeout(30);
    else await answer(page, kind);
  }
  const hand = await page.locator(".sve-hand-own [data-card]").count();
  const card = (await lit.first().boundingBox())!;
  await fingerDrag(page, cdp, { x: card.x + 14, y: card.y + card.height / 2 }, await middle(page.locator(".sve-mat-own .sve-field-slot").nth(2)));
  await expect(page.locator(".sve-hand-own [data-card]")).toHaveCount(hand - 1);
  expect(problems).toEqual([]);
});
