import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { openSetup, showSidebar, startGame, useSettings } from "./helpers";

// The bot levels (docs/bot.md): the setup screen offers them, and a game is played by the levels chosen. Checked by what
// the choices are (the values settings and replays store, engine/protocol.ts SeatController), not by how they are worded.

test("the setup screen offers the bot levels, Bot-Medium chosen at first, each described in its own way", async ({ page }) => {
  await useSettings(page, { uiLang: "en" });
  await openSetup(page);
  const select = page.getByTestId("setup-controller-1");
  const values: (string | null)[] = [];
  for (const option of await select.locator("option").all()) values.push(await option.getAttribute("value"));
  expect(values).toEqual(["greedy", "medium", "hard", "hard-beta", "random", "human"]);
  await expect(select).toHaveValue("medium");
  // The description under the choice follows it: there is one for each level, and they differ.
  const hint = page.getByTestId("setup-controller-hint");
  const descriptions = new Set<string>();
  for (const level of ["greedy", "medium", "hard", "hard-beta"]) {
    await select.selectOption(level);
    await expect(hint).not.toBeEmpty();
    descriptions.add((await hint.textContent()) ?? "");
  }
  expect(descriptions.size).toBe(4);
});

test("Bot-Medium against Bot-Hard beta: they play a game to the end, and its bug report file names those levels", async ({ page }) => {
  await useSettings(page, { uiLang: "en", botDelayMs: 0, setupControllers: ["medium", "hard-beta"], setupDecks: ["samples/sd01.json", "samples/sd02.json"] });
  await startGame(page, "bot-levels");
  await expect(page.locator(".sve-decision")).toHaveAttribute("data-decision", "over", { timeout: 300_000 });
  // The file holds the game's options as the engine's worker got them.
  await showSidebar(page);
  await page.getByRole("button", { name: /^Debug$/ }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /^Save a bug report file$/ }).click();
  const report = JSON.parse(readFileSync((await (await download).path())!, "utf8")) as { options: { controllers: string[] } };
  expect(report.options.controllers).toEqual(["medium", "hard-beta"]);
  await expect(page.locator(".sve-toast")).toHaveCount(0);
});
