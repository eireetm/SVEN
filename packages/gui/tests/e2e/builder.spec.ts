import { expect, test, type Page } from "@playwright/test";
import { useSettings } from "./helpers";

// The deck builder (stage 5): filters, adding by click and drag, removing by right-click and by dragging back to the pool,
// the leader window, save as / delete.
const FILE = "e2e-builder-test.json";

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
  await expect(page.getByTestId("builder-file")).toHaveValue(FILE);
  await expect(page.locator(".sve-unsaved")).toHaveCount(0);
  await page.getByTestId("builder-delete").click();
  await expect(page.getByTestId("builder-file").locator(`option[value="${FILE}"]`)).toHaveCount(0);
  expect(problems).toEqual([]);
});
