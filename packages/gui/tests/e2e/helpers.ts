import { expect, type Page } from "@playwright/test";

// Shared steps of the end-to-end tests: settings before the page loads, and the way from the main menu into a game.
export const SETTINGS_KEY = "sve-gui-settings";

/** Settings the page starts with (the app reads them from localStorage). */
export async function useSettings(page: Page, settings: Record<string, unknown>): Promise<void> {
  await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [SETTINGS_KEY, JSON.stringify(settings)] as const);
}

/** From the main menu to the "Play vs AI" setup, once the engine has started. */
export async function openSetup(page: Page): Promise<void> {
  await page.goto("/");
  const play = page.getByTestId("menu-play");
  await expect(play).toBeEnabled({ timeout: 120_000 });
  await play.click();
  await expect(page.getByTestId("start-game")).toBeEnabled({ timeout: 60_000 });
}

/** Start a game from the setup (with a fixed seed when given). */
export async function startGame(page: Page, seed?: string): Promise<void> {
  await openSetup(page);
  if (seed !== undefined) {
    await page.locator(".sve-advanced summary").click();
    await page.getByTestId("setup-seed").fill(seed);
  }
  await page.getByTestId("start-game").click();
  await expect(page.locator(".sve-table")).toBeVisible();
}
