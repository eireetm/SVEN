import { expect, test, type Page } from "@playwright/test";
import { useSettings } from "./helpers";

// A phone held sideways (docs/android.md; the Android app is this web app in the phone's WebView): the menus fit, the
// table packs tighter with your hand beside your mat, the card panel is a drawer (its button or a long press opens it),
// cards are played by tapping; the deck builder has a deck tab and a pool tab, a tap adds or removes, a long press reads.
test.use({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });

/** A long press of a finger on a card (the pointer events of a touch, held longer than long-press.ts waits): its name. */
async function longPress(page: Page, selector: string): Promise<string> {
  const outer = page.locator(selector).first();
  // The finger lands on the card's picture: the events go there (and bubble), as a real touch's do.
  const target = (await outer.locator(".sve-card-art").count()) > 0 ? outer.locator(".sve-card-art").first() : outer;
  const card = (await outer.getAttribute("title")) !== null ? outer : outer.locator(".sve-card[title]").first();
  const name = (await card.getAttribute("title")) ?? "";
  const box = (await target.boundingBox())!;
  const at = { clientX: box.x + box.width / 2, clientY: box.y + box.height / 2, pointerType: "touch", pointerId: 11, isPrimary: true };
  await target.dispatchEvent("pointerover", at);
  await target.dispatchEvent("pointerdown", { ...at, button: 0 });
  await page.waitForTimeout(700);
  await page.evaluate(`window.dispatchEvent(new PointerEvent("pointerup", ${JSON.stringify(at)}))`);
  await target.dispatchEvent("click", at);
  return name;
}

/** Tap a card of the hand where it shows (the cards overlap: its left part). */
async function tapCard(page: Page, selector: string): Promise<void> {
  const box = (await page.locator(selector).first().boundingBox())!;
  await page.touchscreen.tap(box.x + 8, box.y + box.height / 2);
}

test("a phone: the menus fit, a game is played by tapping, the card panel is a drawer", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(e.message));
  await useSettings(page, { uiLang: "en", botDelayMs: 0, setupDecks: ["samples/sd01.json", "samples/sd02.json"] });
  await page.goto("/");
  const play = page.getByTestId("menu-play");
  await expect(play).toBeEnabled({ timeout: 120_000 });
  // The whole menu is on the screen.
  const menu = (await page.locator(".sve-menu-panel").boundingBox())!;
  expect(menu.y).toBeGreaterThanOrEqual(0);
  expect(menu.y + menu.height).toBeLessThanOrEqual(412);
  await play.tap();
  await expect(page.getByTestId("start-game")).toBeEnabled({ timeout: 60_000 });
  await page.getByTestId("start-game").tap();
  await expect(page.locator(".sve-table[data-compact]")).toBeVisible();
  // No left column: the table has the whole width; the drawer opens from its button and hides again.
  await expect(page.getByTestId("game-left")).toHaveCount(0);
  await page.getByTestId("details-show").tap();
  await expect(page.getByTestId("game-left")).toBeVisible();
  await expect(page.getByTestId("game-menu")).toBeVisible();
  await page.getByTestId("details-hide").tap();
  await expect(page.getByTestId("game-left")).toHaveCount(0);

  // Keep the hand, go first when asked, until your main phase.
  const bar = page.locator(".sve-decision");
  for (let i = 0; i < 40; i++) {
    const kind = await bar.getAttribute("data-decision");
    if (kind === "mainPhase") break;
    if (kind === "mulligan") await page.getByTestId("table-keep").tap();
    else if (kind === "chooseTurnOrder") await page.getByTestId("table-first").tap();
    else if (kind === "quick") await page.getByTestId("table-pass").tap();
    else if (kind === "announcement") await page.getByTestId("announcement-ok").tap();
    await page.waitForTimeout(150);
  }
  await expect(bar).toHaveAttribute("data-decision", "mainPhase");
  // Your hand is beside your mat, at the bottom right.
  const hand = (await page.locator(".sve-hand-own").boundingBox())!;
  const mats = (await page.locator(".sve-mats").boundingBox())!;
  expect(hand.x).toBeGreaterThanOrEqual(mats.x + mats.width - 1);

  // Tap a card the main phase lets you play: its menu; tap "Play".
  const lit = ".sve-hand-own .sve-card-action";
  if ((await page.locator(lit).count()) > 0) {
    const before = Number(await bar.getAttribute("data-inputs"));
    await tapCard(page, lit);
    const item = page.getByTestId("card-menu").getByRole("menuitem").first();
    await expect(item).toBeVisible();
    await item.tap();
    await expect.poll(async () => Number(await bar.getAttribute("data-inputs"))).toBeGreaterThan(before);
  }

  // A long press on a card opens the drawer with that card.
  const held = await longPress(page, ".sve-mat-opponent [data-card]");
  expect(held).not.toBe("");
  await expect(page.getByTestId("game-left")).toBeVisible();
  await expect(page.locator(".sve-drawer .sve-sidebar-card")).toContainText(held);
  await page.getByTestId("details-hide").tap();
  expect(problems).toEqual([]);
});

test("a phone: the deck builder's deck and pool tabs, tap to add or remove, hold to read", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(e.message));
  await useSettings(page, { uiLang: "en", builderDeck: "samples/sd01.json" });
  await page.goto("/");
  const decks = page.getByTestId("menu-decks");
  await expect(decks).toBeEnabled({ timeout: 120_000 });
  await decks.tap();
  const deckTab = page.getByTestId("builder-tab-deck");
  await expect(deckTab).toHaveText("Deck 40 + 8");
  // The pool isn't shown with the deck, nor the deck with the pool.
  await expect(page.getByTestId("builder-pool")).toBeHidden();
  await page.locator(".sve-deck-tile").first().tap();
  await expect(deckTab).toHaveText("Deck 39 + 8");
  await page.getByTestId("builder-tab-pool").tap();
  await expect(page.getByTestId("builder-pool")).toBeVisible();
  await expect(page.getByTestId("builder-deck")).toBeHidden();
  await page.locator(".sve-pool-tile").first().tap();
  await expect(deckTab).toHaveText("Deck 40 + 8");
  // A long press reads the card: nothing is added.
  const held = await longPress(page, ".sve-pool-tile >> nth=1");
  await expect(page.locator(".sve-drawer .sve-sidebar-card")).toContainText(held);
  await expect(deckTab).toHaveText("Deck 40 + 8");
  expect(problems).toEqual([]);
});
