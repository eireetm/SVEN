import { expect, test, type Page } from "@playwright/test";

// End-to-end: the page starts the engine worker, a game is set up and played through the decision bar by clicking, and
// no error appears. Screenshots go to test-results/ for a look.
const SETTINGS_KEY = "sve-gui-settings";

async function useSettings(page: Page, settings: Record<string, unknown>): Promise<void> {
  await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [SETTINGS_KEY, JSON.stringify(settings)] as const);
}

async function startGame(page: Page): Promise<void> {
  await page.goto("/");
  const start = page.getByTestId("start-game");
  await expect(start).toBeEnabled({ timeout: 120_000 });
  await start.click();
  await expect(page.locator(".sve-board")).toBeVisible();
}

/** Answer whatever the decision bar asks with the simplest button. Returns false once the game is over. */
async function answerOnce(page: Page): Promise<boolean> {
  const bar = page.locator(".sve-decision");
  const kind = await bar.getAttribute("data-decision");
  const buttons = bar.locator(".sve-decision-body button:not([disabled])");
  const click = async (name: RegExp) => {
    const button = bar.getByRole("button", { name });
    if ((await button.count()) > 0 && (await button.first().isEnabled())) await button.first().click();
  };
  switch (kind) {
    case "over":
      return false;
    case "waiting":
      await page.waitForTimeout(50);
      return true;
    case "chooseTurnOrder":
      await click(/^Go first$/);
      break;
    case "mulligan":
      await click(/^Keep$/);
      break;
    case "mainPhase":
      await click(/^End main phase$/);
      break;
    case "quick":
      await click(/^Pass$/);
      break;
    case "selectCards": {
      const candidates = bar.locator(".sve-choice-cards .sve-card");
      if ((await candidates.count()) > 0) await candidates.first().click();
      await click(/^Confirm$/);
      await click(/^Select none$/);
      break;
    }
    case "confirm":
      await click(/^Yes$/);
      break;
    case "orderCards":
      await click(/^Confirm$/);
      break;
    default: {
      // selectPending, choose: the first option.
      const checkbox = bar.locator("input[type=checkbox]:not([disabled])");
      if ((await checkbox.count()) > 0) {
        await checkbox.first().check();
        await click(/^Confirm$/);
      } else if ((await buttons.count()) > 0) await buttons.first().click();
    }
  }
  await page.waitForTimeout(30);
  return true;
}

test("a person plays a whole game against the random bot by clicking", async ({ page }) => {
  await useSettings(page, { botDelayMs: 0, setupControllers: ["human", "random"], setupDecks: ["samples/sd01.json", "samples/sd04.json"] });
  await startGame(page);
  await page.screenshot({ path: "test-results/01-start.png" });
  let shot = false;
  for (let i = 0; i < 1500 && (await answerOnce(page)); i++) {
    if (!shot && (await page.locator(".sve-decision").getAttribute("data-decision")) === "mainPhase") {
      const turn = await page.locator(".sve-status").innerText();
      if (/Turn [4-9]/.test(turn)) {
        await page.screenshot({ path: "test-results/02-midgame.png" });
        shot = true;
      }
    }
  }
  await expect(page.locator(".sve-decision")).toHaveAttribute("data-decision", "over");
  await page.screenshot({ path: "test-results/03-over.png" });
  await expect(page.locator(".sve-toast")).toHaveCount(0);
  await expect(page.locator(".sve-log-line").first()).toBeVisible();
  // Undo goes back to before the person's last answer: the game is on again and it is their decision.
  await page.getByRole("button", { name: /^Debug$/ }).click();
  await page.getByRole("button", { name: /^Undo my last answer$/ }).click();
  await expect(page.locator(".sve-decision")).not.toHaveAttribute("data-decision", /^(over|waiting)$/);
  await expect(page.locator(".sve-status")).not.toContainText("Game over");
});

test("the deck editor opens a sample deck with card names, and the engine checks it", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("start-game")).toBeVisible({ timeout: 120_000 });
  await page.getByRole("button", { name: /^Decks$/ }).click();
  await page.locator(".sve-decks-files li button", { hasText: /^SD01 —/ }).click();
  const text = page.locator(".sve-deck-text");
  await expect(text).toHaveValue(/leader: SD01-LD01 {2}; \S/);
  await expect(text).toHaveValue(/\[evolve\]/);
  await page.getByRole("button", { name: /^Check$/ }).click();
  await expect(page.getByText("Legal with deck restrictions.")).toBeVisible();
  // A card from the search goes into the text; more than three copies make the deck illegal (CR 6.1.1.4).
  await page.locator(".sve-search").fill("SD01-011");
  for (let i = 0; i < 4; i++) await page.locator(".sve-search-result").first().getByRole("button").click();
  await page.getByRole("button", { name: /^Check$/ }).click();
  await expect(page.locator(".sve-decks-editor .sve-problems")).toBeVisible();
  await expect(page.locator(".sve-toast")).toHaveCount(0);
});

test("two bots play a game to the end, and the debug panel saves a replay", async ({ page }) => {
  await useSettings(page, { botDelayMs: 0, setupControllers: ["greedy", "random"], setupDecks: ["samples/csd02a.json", "samples/csd03b.json"] });
  await startGame(page);
  await expect(page.locator(".sve-decision")).toHaveAttribute("data-decision", "over", { timeout: 150_000 });
  await page.getByRole("button", { name: /^Debug$/ }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /^Save replay$/ }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^sve-replay-.*\.json$/);
  await page.screenshot({ path: "test-results/04-bots.png" });
  await expect(page.locator(".sve-toast")).toHaveCount(0);
});
