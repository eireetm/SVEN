import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { showSidebar, startGame, useSettings } from "./helpers";

// Redrawing the opening hand (CR 6.2.1.8): the hand goes to the bottom of the deck in the order the person chooses. The
// "Redraw" button opens the decision window with the hand as a pile; "Up" and "Down" move a card there at once, "Cancel"
// goes back to keeping or redrawing, and the order chosen is the one the engine gets (the bug report file's answers).

/** The cards of the pile, top first. */
async function order(page: Page): Promise<string[]> {
  const rows = page.locator("[data-card-order]");
  const out: string[] = [];
  for (let i = 0; i < (await rows.count()); i++) out.push((await rows.nth(i).getAttribute("data-card-order"))!);
  return out;
}

test("redrawing: the hand's order on the bottom of the deck is the person's", async ({ page }) => {
  await useSettings(page, { uiLang: "en", botDelayMs: 0, setupDecks: ["samples/sd01.json", "samples/sd02.json"] });
  await startGame(page);
  const bar = page.locator(".sve-decision");
  for (let i = 0; i < 40 && (await bar.getAttribute("data-decision")) !== "mulligan"; i++) {
    if ((await bar.getAttribute("data-decision")) === "chooseTurnOrder") await page.getByTestId("table-first").click();
    await page.waitForTimeout(100);
  }
  await expect(bar).toHaveAttribute("data-decision", "mulligan");

  await page.getByTestId("table-redraw").click();
  await expect(page.locator("[data-card-order]")).toHaveCount(4);
  const hand = await order(page);
  // The first card goes down one, the last one up one: the list shows it at once.
  await page.getByTestId("order-down").first().click();
  await page.getByTestId("order-up").last().click();
  expect(await order(page)).toEqual([hand[1], hand[0], hand[3], hand[2]]);
  await expect(page.getByTestId("order-up").first()).toBeDisabled();
  await expect(page.getByTestId("order-down").last()).toBeDisabled();

  // Cancel: back to keeping or redrawing; nothing was answered.
  await page.getByTestId("mulligan-cancel").click();
  await expect(page.getByTestId("card-order")).toHaveCount(0);
  await expect(page.getByTestId("table-keep")).toBeVisible();
  await expect(bar).toHaveAttribute("data-decision", "mulligan");

  // Redraw with the third card on top.
  await page.getByTestId("table-redraw").click();
  expect(await order(page)).toEqual(hand);
  await page.getByTestId("order-up").nth(2).click();
  await page.getByTestId("order-up").nth(1).click();
  const chosen = [hand[2], hand[0], hand[1], hand[3]];
  expect(await order(page)).toEqual(chosen);
  await page.getByTestId("mulligan-redraw").click();
  await expect(bar).not.toHaveAttribute("data-decision", "mulligan");

  // The engine got that order.
  await showSidebar(page);
  await page.getByRole("button", { name: /^Debug$/ }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /^Save a bug report file$/ }).click();
  const replay = JSON.parse(readFileSync((await (await download).path())!, "utf8")) as { inputs: { input: { type: string; redraw?: boolean; bottomOrder?: string[] } }[] };
  const redraws = replay.inputs.map((recorded) => recorded.input).filter((input) => input.type === "mulligan" && input.redraw);
  expect(redraws.map((input) => input.bottomOrder)).toContainEqual(chosen);
});
