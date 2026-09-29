import { expect, test } from "@playwright/test";
import { openSetup, startGame, useSettings } from "./helpers";

// Formats in the game setup (its "Advanced"): a restriction list keeps a deck with a banned card from starting a game;
// a Cross Craft game shows each player's two leaders and classes.

test("the setup's format and restriction list decide which decks can start a game", async ({ page }) => {
  await useSettings(page, { uiLang: "en", format: "standard", restrictionLists: {}, setupDecks: ["samples/csd03a.json", "samples/sd01.json"] });
  await openSetup(page);
  const start = page.getByTestId("start-game");
  await expect(start).toBeEnabled();
  await expect(page.getByTestId("setup-format")).toHaveText("Format: Standard");

  // Asia's list bans Stardust Trumpeter, which the CSD03a sample has.
  await page.locator(".sve-advanced summary").click();
  await page.getByTestId("format-list").selectOption("01_26_JPN");
  await expect(page.getByTestId("setup-problems-0")).toContainText("is banned (01_26_JPN)");
  await expect(start).toBeDisabled();
  await expect(page.getByTestId("setup-format")).toHaveText("Format: Standard · 01_26_JPN");

  // Unlimited: no list, anything the engine can play.
  await page.getByTestId("format-select").selectOption("unlimited");
  await expect(page.getByTestId("format-list")).toHaveCount(0);
  await expect(start).toBeEnabled();

  // Cross Craft: one-class decks with one leader aren't Cross Craft decks.
  await page.getByTestId("format-select").selectOption("crossCraft");
  await expect(page.getByTestId("setup-problems-1")).toContainText("Cross Craft needs two leader cards");
  await expect(start).toBeDisabled();
});

test("a Cross Craft game: two leaders on each mat, in a window like a pile, and the classes beside the players", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(e.message));
  await useSettings(page, {
    uiLang: "en",
    botDelayMs: 0,
    format: "crossCraft",
    restrictionLists: { crossCraft: "05_26_JPN_CROSS" },
    setupControllers: ["human", "greedy"],
    setupDecks: ["samples/cross-sd01-sd02.json", "samples/cross-sd01-sd02.json"],
  });
  await startGame(page);
  for (const seat of [0, 1]) {
    await expect(page.getByTestId(`leader-${seat}`)).toHaveClass(/sve-leader-two/);
    await expect(page.getByTestId(`player-basis-${seat}`)).toHaveText("Forestcraft / Swordcraft");
  }
  // A click on the leader (the decision gives it nothing to do) opens both.
  await page.getByTestId("leader-0").locator(".sve-leader-card").click();
  const window = page.locator(".sve-modal");
  await expect(window).toContainText("Player 1 · Leader");
  await expect(window.locator(".sve-card")).toHaveCount(2);
  await page.keyboard.press("Escape");
  await expect(window).toHaveCount(0);
  expect(problems).toEqual([]);
});
