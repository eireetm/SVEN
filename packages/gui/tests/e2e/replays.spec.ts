import { expect, test } from "@playwright/test";
import { startGame, useSettings } from "./helpers";

// Replays (docs/gui.md "录像"): a finished game is saved as a file ("Save replay"); the main menu's "Watch replays" lists it,
// and watching plays it back step by step, with its playback bar: pause, a step forward and back, the progress bar, whose
// view, watch again at the end; then it is deleted.

let saved: string | null = null;

test.afterEach(async ({ request }) => {
  if (saved) await request.delete(`/api/replays/${encodeURIComponent(saved)}`);
  saved = null;
});

test("save a finished game as a replay, then watch it from the main menu", async ({ page }) => {
  test.setTimeout(180_000);
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("dialog", (d) => void d.accept());
  await useSettings(page, { uiLang: "en", botDelayMs: 0, setupControllers: ["random", "random"], setupDecks: ["samples/sd01.json", "samples/sd02.json"] });
  await startGame(page, "replay-e2e");
  const bar = page.locator(".sve-decision");
  await expect(bar).toHaveAttribute("data-decision", "over", { timeout: 120_000 });

  // Save it.
  await page.getByTestId("result-save-replay").click();
  const note = page.getByTestId("result-saved");
  await expect(note).toHaveText(/^Saved: .+\.json$/);
  saved = (await note.innerText()).replace(/^Saved: /, "").trim();
  await expect(page.getByTestId("result-save-replay")).toBeDisabled();

  // The main menu's replays: it is listed; watch it.
  await page.getByRole("button", { name: /^Main menu$/ }).click();
  await page.getByTestId("menu-replays").click();
  const row = page.locator(`[data-testid=replay-row][data-file="${saved}"]`);
  await expect(row).toBeVisible();
  await expect(row).toContainText("wins");
  await row.getByTestId("replay-watch").click();

  // It plays by itself: nobody is asked anything.
  const watch = page.getByTestId("watch-bar");
  await expect(watch).toBeVisible();
  await expect(bar).toHaveAttribute("data-decision", "watching");
  const position = async () => Number((await page.getByTestId("watch-position").innerText()).split("/")[0]!.trim());
  await page.getByTestId("watch-speed").selectOption("4");
  await expect.poll(position, { timeout: 20_000 }).toBeGreaterThan(3);

  // Pause, a step forward, a step back.
  await page.getByTestId("watch-play").click();
  const paused = await position();
  await page.waitForTimeout(600);
  expect(await position()).toBe(paused);
  await page.getByTestId("watch-forward").click();
  await expect.poll(position).toBeGreaterThan(paused);
  const ahead = await position();
  await page.getByTestId("watch-back").click();
  await expect.poll(position).toBeLessThan(ahead);

  // Player 2's view: their panel is the own one (bottom right).
  await page.getByTestId("watch-view").selectOption("1");
  await expect(page.getByTestId("player-panel-1")).toHaveClass(/sve-player-own/);

  // To the end on the progress bar: the result, and "watch again" from the start.
  const seek = page.getByTestId("watch-seek");
  const total = Number(await seek.getAttribute("max"));
  await seek.fill(String(total));
  await expect(page.getByTestId("result-watch-again")).toBeVisible();
  await page.getByTestId("result-watch-again").click();
  await expect.poll(position).toBeLessThan(total);

  // Back to the list; delete it.
  await page.getByTestId("watch-exit").click();
  await expect(row).toBeVisible();
  await row.getByTestId("replay-delete").click();
  await expect(row).toHaveCount(0);
  saved = null;
  expect(problems).toEqual([]);
});
