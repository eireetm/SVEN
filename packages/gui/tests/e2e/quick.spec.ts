import { expect, test, type Page } from "@playwright/test";
import { answer, clickCard, showSidebar, startGame, useSettings } from "./helpers";

// Quick cards and abilities played at quick timing resolve at once: a window then tells who played what and its targets,
// and the game waits for OK. And who goes first, chosen in the setup's advanced options.

const SHOTS = process.env.SVE_QUICK_SHOTS;

/**
 * Play on the simplest way, but play a Quick card whenever one can be played at quick timing, until an announcement shows
 * (`own`: one of this player's, else the opponent's). Returns the window.
 */
async function untilAnnouncement(page: Page, own: boolean | null, limit = 400) {
  const bar = page.locator(".sve-decision");
  for (let i = 0; i < limit; i++) {
    const kind = (await bar.getAttribute("data-decision"))!;
    if (kind === "over") break;
    if (kind === "announcement") {
      const window = page.getByTestId("announcement");
      const mine = (await window.locator(".sve-announce-own").count()) > 0;
      if (own === null || mine === own) return window;
      const seq = await bar.getAttribute("data-announcement");
      await page.getByTestId("announcement-ok").click();
      await expect(bar).not.toHaveAttribute("data-announcement", seq!);
      continue;
    }
    if (kind === "waiting" || (await bar.getAttribute("class"))!.includes("sve-busy")) {
      await page.waitForTimeout(20);
      continue;
    }
    const inputs = await bar.getAttribute("data-inputs");
    const lit = page.locator(".sve-table .sve-card-action");
    if (kind === "quick" && (await lit.count()) > 0) {
      await clickCard(lit.first());
      const items = page.getByTestId("card-menu").getByRole("menuitem");
      if ((await items.count()) > 0) await items.first().click();
      else await page.keyboard.press("Escape");
    } else await answer(page, kind);
    await expect
      .poll(async () => (await bar.getAttribute("data-inputs")) !== inputs || (await bar.getAttribute("data-decision")) === "announcement", { intervals: [10, 20, 50] })
      .toBe(true);
  }
  throw new Error("no announcement");
}

test("a Quick card played at quick timing: a window tells who played what, and the game waits for OK", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(e.message));
  await useSettings(page, {
    uiLang: "en",
    botDelayMs: 0,
    setupControllers: ["human", "random"],
    setupDecks: ["samples/sd03.json", "samples/sd03.json"],
    setupTurnOrder: "player1",
  });
  await startGame(page, "quick-e2e");
  const bar = page.locator(".sve-decision");

  // The opponent's: at the top right, with the card; nothing moves until OK.
  const theirs = await untilAnnouncement(page, false);
  await expect(theirs.locator(".sve-announce-opponent")).toBeVisible();
  await expect(theirs).toContainText("Player 2 (Random bot) played");
  await expect(theirs.locator(".sve-announce-card .sve-card")).toBeVisible();
  if (SHOTS) await page.waitForTimeout(900).then(() => page.screenshot({ path: `${SHOTS}/quick-opponent.png` }));
  const inputs = await bar.getAttribute("data-inputs");
  await page.waitForTimeout(300);
  await expect(bar).toHaveAttribute("data-inputs", inputs!);
  await expect(bar).toHaveAttribute("data-decision", "announcement");
  await page.getByTestId("announcement-ok").click();
  await expect(bar).not.toHaveAttribute("data-decision", "announcement");

  // One's own: at the bottom left.
  const mine = await untilAnnouncement(page, true);
  await expect(mine.locator(".sve-announce-own")).toBeVisible();
  await expect(mine).toContainText("Player 1 played");
  if (SHOTS) await page.waitForTimeout(900).then(() => page.screenshot({ path: `${SHOTS}/quick-own.png` }));
  await page.keyboard.press("Escape");
  await expect(bar).not.toHaveAttribute("data-decision", "announcement");
  expect(problems).toEqual([]);
});

test("who goes first: player 2, without anyone choosing (the setup's advanced options)", async ({ page }) => {
  await useSettings(page, { uiLang: "en", botDelayMs: 0, setupControllers: ["human", "greedy"] });
  await startGame(page, "turn-order-e2e");
  // The rules: a random player decides (this seed: a choice or the bot's).
  await page.getByTestId("game-menu").click();
  await page.getByTestId("menu-play").click();
  await page.locator(".sve-advanced summary").click();
  await page.getByTestId("setup-turn-order").selectOption("player2");
  await page.getByTestId("start-game").click();
  const bar = page.locator(".sve-decision");
  // Nobody chooses: the first player (the bot) keeps or redraws first (CR 6.2.1.8), then this player.
  await expect(bar).toHaveAttribute("data-decision", "mulligan");
  await answer(page, "mulligan");
  // The bot's turn 1, then this player's first main phase in turn 2.
  await expect(bar).toHaveAttribute("data-decision", "mainPhase", { timeout: 20_000 });
  await expect(page.locator(".sve-center-status")).toContainText("Turn 2");
  await showSidebar(page);
  await expect(page.locator(".sve-log")).toContainText("Player 2 (Bot-Easy) goes first.");
});
