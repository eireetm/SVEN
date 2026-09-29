import { expect, test, type Locator, type Page } from "@playwright/test";
import { startGame, useSettings } from "./helpers";

// The main menu and the settings; a game played on the table itself: cards dragged onto the mat to play them, a follower's
// menu to attack, a follower dragged onto the enemy leader to attack.

test("the main menu leads to the settings, where the interface language changes", async ({ page }) => {
  await useSettings(page, { uiLang: "en" });
  await page.goto("/");
  await expect(page.getByTestId("menu-play")).toHaveText("Play vs AI");
  await page.getByTestId("menu-settings").click();
  await page.getByTestId("settings-ui-lang").selectOption("zh");
  // The interface's transparency: 30% makes panels 0.7 opaque; "default" gives the style's own back.
  const alpha = () => page.evaluate<string>("getComputedStyle(document.documentElement).getPropertyValue('--sve-ui-alpha').trim()");
  await page.getByTestId("settings-ui-transparency").fill("0.3");
  await expect.poll(alpha).toBe("0.7");
  await page.getByRole("button", { name: "默认" }).click();
  await expect.poll(alpha).toBe("0.88");
  await page.getByRole("button", { name: "返回" }).click();
  await expect(page.getByTestId("menu-play")).toHaveText("对战 AI");
  await expect(page.getByTestId("menu-settings")).toHaveText("设置");
});

async function center(locator: Locator): Promise<{ x: number; y: number }> {
  const box = (await locator.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/**
 * Start dragging `attacker`; if the table lights up attack targets, drop it on the first one. Otherwise cancel (Escape) and
 * say so: the card may only have other actions (evolve, abilities).
 */
async function dragToTarget(page: Page, attacker: Locator): Promise<boolean> {
  const a = await center(attacker);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(a.x + 10, a.y - 15);
  await page.mouse.move(a.x + 20, a.y - 30);
  const target = page.locator(".sve-card-target").first();
  if ((await target.count()) === 0) {
    await page.keyboard.press("Escape");
    await page.mouse.up();
    return false;
  }
  const b = await center(target);
  for (let i = 1; i <= 10; i++) await page.mouse.move(a.x + ((b.x - a.x) * i) / 10, a.y + ((b.y - a.y) * i) / 10);
  await page.mouse.up();
  return true;
}

async function drag(page: Page, from: Locator, to: Locator): Promise<void> {
  const a = await center(from);
  const b = await center(to);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(a.x + ((b.x - a.x) * i) / 10, a.y + ((b.y - a.y) * i) / 10);
  await page.mouse.up();
}

test("a person plays on the table: drags cards to play them and attacks from a menu and by dragging", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(`page error: ${e.message}`));
  await useSettings(page, { uiLang: "en", botDelayMs: 0, setupControllers: ["human", "greedy"], setupDecks: ["samples/sd01.json", "samples/sd02.json"] });
  await startGame(page, "table-test");
  const bar = page.locator(".sve-decision");
  const inputs = async () => Number(await bar.getAttribute("data-inputs"));
  const done = { play: 0, menuAttack: 0, dragAttack: 0 };
  for (let step = 0; step < 300 && (done.play === 0 || done.menuAttack === 0 || done.dragAttack === 0); step++) {
    const kind = (await bar.getAttribute("data-decision"))!;
    if (kind === "over") break;
    if (kind === "waiting" || (await bar.getAttribute("class"))!.includes("sve-busy")) {
      await page.waitForTimeout(30);
      continue;
    }
    const before = await inputs();
    let action: keyof typeof done | null = null;
    if (kind === "chooseTurnOrder") await page.getByTestId("table-first").click();
    else if (kind === "mulligan") await page.getByTestId("table-keep").click();
    else if (kind === "quick") await page.getByTestId("table-pass").click();
    else if (kind === "mainPhase") {
      const handCard = page.locator(".sve-hand-own .sve-card-action").first();
      const lit = page.locator(".sve-mat-own .sve-field-slot .sve-card-action");
      const attacker = lit.first();
      if ((await handCard.count()) > 0 && done.play < 3) {
        await drag(page, handCard, page.locator(".sve-mat-own .sve-field-slot").nth(2));
        action = "play";
      } else if ((await attacker.count()) > 0 && done.menuAttack === 0) {
        await attacker.click();
        const attack = page.getByTestId("card-menu").getByRole("menuitem", { name: /^Attack → / }).first();
        if ((await attack.count()) > 0) {
          await attack.click();
          action = "menuAttack";
        } else await page.keyboard.press("Escape");
      } else if ((await attacker.count()) > 0 && done.dragAttack === 0) {
        for (let i = 0; i < (await lit.count()) && action === null; i++) if (await dragToTarget(page, lit.nth(i))) action = "dragAttack";
      }
      if (action === null) await page.getByTestId("table-end").click();
    } else {
      // Anything else (targets, choices) through the decision panel's first option.
      const body = bar.locator(".sve-decision-body");
      const cards = body.locator(".sve-choice-cards .sve-card");
      if (kind === "selectCards" && (await cards.count()) > 0) {
        await cards.first().click();
        const confirm = body.getByRole("button", { name: /^Confirm$/ });
        if ((await confirm.count()) > 0 && (await confirm.isEnabled())) await confirm.click();
      } else await body.locator("button:not([disabled])").first().click();
    }
    await expect.poll(inputs, { message: `${action ?? kind} was answered` }).toBeGreaterThan(before);
    if (action) done[action]++;
    expect(problems).toEqual([]);
  }
  expect(done.play).toBeGreaterThan(0);
  expect(done.menuAttack).toBe(1);
  expect(done.dragAttack).toBe(1);
  await expect(page.locator(".sve-toast")).toHaveCount(0);
});

test("with card spots chosen by hand, a follower waits for its slot and goes where it is clicked", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(`page error: ${e.message}`));
  await useSettings(page, { uiLang: "en", botDelayMs: 0, manualSlots: true, setupControllers: ["human", "greedy"], setupDecks: ["samples/sd01.json", "samples/sd02.json"] });
  await startGame(page, "slots-test");
  const bar = page.locator(".sve-decision");
  const prompt = page.getByTestId("table-choose-slot");
  for (let step = 0; step < 200 && (await prompt.count()) === 0; step++) {
    const kind = (await bar.getAttribute("data-decision"))!;
    if (kind === "over") break;
    if (kind === "waiting" || (await bar.getAttribute("class"))!.includes("sve-busy")) {
      await page.waitForTimeout(30);
      continue;
    }
    if (kind === "chooseTurnOrder") await page.getByTestId("table-first").click();
    else if (kind === "mulligan") await page.getByTestId("table-keep").click();
    else if (kind === "quick") await page.getByTestId("table-pass").click();
    else if (kind === "mainPhase") {
      const handCard = page.locator(".sve-hand-own .sve-card-action").first();
      if ((await handCard.count()) > 0) await drag(page, handCard, page.locator(".sve-mat-own .sve-field-slot").nth(2));
      else await page.getByTestId("table-end").click();
    } else await bar.locator(".sve-decision-body button:not([disabled])").first().click();
    await page.waitForTimeout(150);
  }
  // The new card waits in the first free slot; the free slots light up; a click puts it in slot 3.
  await expect(prompt).toBeVisible();
  const waiting = page.locator(".sve-mat-own .sve-slot-waiting .sve-card");
  await expect(waiting).toHaveCount(1);
  const card = await waiting.getAttribute("data-card");
  await page.getByTestId("slot-field-3").click();
  await expect(page.locator(`.sve-mat-own .sve-field-slot[data-slot="3"] [data-card="${card}"]`)).toHaveCount(1);
  await expect(prompt).toHaveCount(0);
  expect(problems).toEqual([]);
});
