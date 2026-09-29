import { expect, test, type Page } from "@playwright/test";
import { useSettings } from "./helpers";

// The deck builder (stage 5): filters, adding by click and drag, removing by right-click and by dragging back to the pool,
// the leader window, save as / delete; the format (Cross Craft: two leaders) and what a deck doesn't meet, told on saving
// and leaving.
const FILE = "e2e-builder-test.json";
const CROSS_FILE = "e2e-cross-test.json";

async function openBuilder(page: Page): Promise<void> {
  await page.goto("/");
  const decks = page.getByTestId("menu-decks");
  await expect(decks).toBeEnabled({ timeout: 120_000 });
  await decks.click();
  await expect(page.locator(".sve-pool-tile").first()).toBeVisible();
}

const count = (page: Page, section: "main" | "evolve") => page.locator(`[data-section=${section}] .sve-deck-tile`).count();

test("builds a deck: filters, click and drag to add, right-click and drag back to remove, leader, save and delete", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("dialog", (d) => void d.accept());
  await useSettings(page, { uiLang: "en", builderDeck: null });
  await openBuilder(page);
  await page.getByRole("button", { name: /^New$/ }).click();

  // Forestcraft followers: three clicks add three cards to the main deck.
  await page.getByLabel("Class").selectOption("Forestcraft");
  await page.getByTestId("builder-type").selectOption("follower");
  const tiles = page.locator(".sve-pool-tile");
  for (let i = 0; i < 3; i++) await tiles.nth(i).click();
  expect(await count(page, "main")).toBe(3);
  await expect(tiles.first().locator(".sve-pool-count")).toHaveText("×1");

  // Evolve deck cards go to the evolve deck.
  await page.getByTestId("builder-type").selectOption("evolve");
  await tiles.first().click();
  expect(await count(page, "evolve")).toBe(1);

  // Drag a card in; right-click one out; drag one back onto the pool.
  await page.getByTestId("builder-type").selectOption("follower");
  await tiles.nth(5).dragTo(page.getByTestId("builder-deck"));
  expect(await count(page, "main")).toBe(4);
  await page.locator("[data-section=main] .sve-deck-tile").first().click({ button: "right" });
  expect(await count(page, "main")).toBe(3);
  await page.locator("[data-section=main] .sve-deck-tile").first().dragTo(page.getByTestId("builder-pool"));
  expect(await count(page, "main")).toBe(2);
  // Dropped anywhere else, a deck card stays.
  await page.locator("[data-section=main] .sve-deck-tile").first().dragTo(page.locator(".sve-builder-top"));
  expect(await count(page, "main")).toBe(2);

  // Sorted by cost; the ability filter keeps cards whose text names the ability.
  await page.getByTestId("builder-sort-cost").click();
  await page.getByTestId("builder-ability").selectOption("ward");
  await expect(page.locator(".sve-builder-pool-header strong")).not.toHaveText("0 cards");
  await page.getByTestId("builder-ability").selectOption("any");

  // The search needs every word; "-word" excludes.
  await page.getByRole("button", { name: /^Clear filters$/ }).click();
  await page.getByTestId("builder-search").fill("fairy -fanfare");
  await expect(page.locator(".sve-builder-pool-header strong")).not.toHaveText("0 cards");

  // The leader window.
  await page.getByTestId("builder-leader").click();
  const option = page.locator(".sve-leader-option[data-leader]").first();
  const leader = (await option.locator(".sve-leader-name").innerText()).trim();
  await option.click();
  await expect(page.getByTestId("builder-leader")).toHaveText(`Leader: ${leader}`);

  // Save as a new file; it is listed; delete it.
  await page.getByTestId("builder-name").fill("E2E builder test");
  await page.getByTestId("builder-save").click();
  await page.getByTestId("builder-saveas-name").fill(FILE);
  await page.getByTestId("builder-saveas-ok").click();
  // Two cards are no standard deck: saved all the same, and told why it can't be played.
  await expect(page.getByTestId("format-problems")).toContainText("The main deck has 2 cards");
  await page.getByTestId("format-problems-ok").click();
  await expect(page.getByTestId("builder-file")).toHaveValue(FILE);
  await expect(page.locator(".sve-unsaved")).toHaveCount(0);
  await page.getByTestId("builder-delete").click();
  await expect(page.getByTestId("builder-file").locator(`option[value="${FILE}"]`)).toHaveCount(0);
  expect(problems).toEqual([]);
});

test("lists alternate printings, keeps the card panel on the last card, shows a large picture", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(e.message));
  await useSettings(page, { uiLang: "en", builderDeck: null, builderAllPrintings: false });
  await openBuilder(page);
  await page.getByRole("button", { name: /^New$/ }).click();

  // All versions: Rose Queen's three printings side by side; the Ultimate one goes into the deck as itself.
  await page.getByTestId("builder-all-printings").check();
  await page.getByTestId("builder-search").fill("rose queen");
  const ultimate = page.locator('.sve-pool-tile[data-printing="BP01-U01"]');
  await expect(page.locator('.sve-pool-tile[data-printing="BP01-SL01"]')).toBeVisible();
  await ultimate.click();
  await expect(page.locator('[data-section=main] .sve-deck-tile[data-printing="BP01-U01"]')).toHaveCount(1);
  await expect(page.locator('.sve-pool-tile[data-printing="BP01-001"] .sve-pool-count')).toHaveText("(1)");

  // The card panel keeps the card the pointer left, and names its base card.
  await ultimate.hover();
  await page.mouse.move(5, 5);
  await expect(page.locator(".sve-details-meta")).toContainText("a printing of BP01-001");
  await expect(page.getByTestId("details-printings")).toContainText("BP01-SL01");

  // Its picture, large; Escape closes it.
  await page.getByTestId("details-art").click();
  await expect(page.getByTestId("art-viewer")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("art-viewer")).toHaveCount(0);
  expect(problems).toEqual([]);
});

test("Cross Craft: two leaders; saving and leaving tell what the deck doesn't meet, and don't stop", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("dialog", (d) => void d.accept());
  await useSettings(page, { uiLang: "en", builderDeck: null, format: "crossCraft", restrictionLists: { crossCraft: "09_26_EN_CROSS" } });
  await openBuilder(page);
  await page.getByRole("button", { name: /^New$/ }).click();
  await expect(page.getByTestId("format-select")).toHaveValue("crossCraft");
  await expect(page.getByTestId("format-list")).toHaveValue("09_26_EN_CROSS");

  // A Forestcraft and a Swordcraft leader.
  await page.getByTestId("builder-leader").click();
  await page.locator('.sve-leader-option[data-leader="SD01-LD01"]').click();
  await page.getByTestId("builder-leader2").click();
  await page.locator('.sve-leader-option[data-leader="SD02-LD01"]').click();
  await expect(page.getByTestId("builder-leader")).toContainText("Leader 1:");
  await expect(page.getByTestId("builder-leader2")).toContainText("Leader 2:");

  // A Runecraft card goes in: nothing stops it.
  await page.getByTestId("builder-search").fill("SD03-001");
  await page.locator(".sve-pool-tile").first().click();
  expect(await count(page, "main")).toBe(1);

  // Saving saves, then tells: the Runecraft card, and 9 cards of each class (the English site's Cross Craft rule).
  await page.getByTestId("builder-name").fill("E2E cross test");
  await page.getByTestId("builder-save").click();
  await page.getByTestId("builder-saveas-name").fill(CROSS_FILE);
  await page.getByTestId("builder-saveas-ok").click();
  const told = page.getByTestId("format-problems");
  await expect(told).toContainText("(Runecraft) is not of the leaders' classes (Forestcraft / Swordcraft)");
  await expect(told).toContainText("at least 9 Forestcraft");
  await page.getByTestId("format-problems-ok").click();
  await expect(page.getByTestId("builder-file")).toHaveValue(CROSS_FILE);

  // Leaving tells too: keep editing, or leave anyway.
  await page.getByTestId("builder-back").click();
  await expect(told).toBeVisible();
  await page.getByTestId("format-problems-stay").click();
  await expect(told).toHaveCount(0);
  await page.getByTestId("builder-delete").click();
  await expect(page.getByTestId("builder-file").locator(`option[value="${CROSS_FILE}"]`)).toHaveCount(0);
  await page.getByTestId("builder-back").click();
  await expect(told).toContainText("Cross Craft needs two leader cards");
  await page.getByTestId("format-problems-leave").click();
  await expect(page.getByTestId("menu-decks")).toBeVisible();
  expect(problems).toEqual([]);
});
