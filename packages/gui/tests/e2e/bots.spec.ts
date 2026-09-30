import { expect, test } from "@playwright/test";
import { openSetup, startGame, useSettings } from "./helpers";

// The bot levels (docs/bot.md): the setup screen offers them and says what each does, and the planning bots play a game
// in the engine worker.

test("the setup screen offers Bot-Easy, Bot-Medium (the default) and Bot-Hard, and says what each does", async ({ page }) => {
  await useSettings(page, { uiLang: "zh" });
  await openSetup(page);
  const select = page.getByTestId("setup-controller-1");
  await expect(select).toHaveValue("medium");
  expect(await select.locator("option").allTextContents()).toEqual(["Bot-简单", "Bot-中等", "Bot-困难", "随机 Bot", "人类"]);
  const hint = page.getByTestId("setup-controller-hint");
  await expect(hint).toContainText("规划整个回合");
  await select.selectOption("hard");
  await expect(hint).toContainText("作弊");
  await page.screenshot({ path: "test-results/bots-setup.png" });
  await select.selectOption("greedy");
  await expect(hint).toContainText("每次只考虑一个动作");
});

test("Bot-Medium and Bot-Hard play a game to the end", async ({ page }) => {
  await useSettings(page, { uiLang: "en", botDelayMs: 0, setupControllers: ["medium", "hard"], setupDecks: ["samples/sd01.json", "samples/sd02.json"] });
  await startGame(page, "bot-levels");
  await expect(page.locator(".sve-decision")).toHaveAttribute("data-decision", "over", { timeout: 300_000 });
  await expect(page.locator(".sve-toast")).toHaveCount(0);
});
