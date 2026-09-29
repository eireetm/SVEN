import { expect, test, type Browser, type Page } from "@playwright/test";
import { useSettings } from "./helpers";

// Online play (docs/online.md), first step: two programs connect — by codes passed by hand (no relay: runs offline), or by a
// room code through the public relays (SVE_E2E_ONLINE=1: needs the internet) — then chat, and one leaves.

async function openOnline(browser: Browser): Promise<Page> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await useSettings(page, { uiLang: "en" });
  await page.goto("/");
  await expect(page.getByTestId("menu-online")).toBeEnabled({ timeout: 120_000 });
  await page.getByTestId("menu-online").click();
  await expect(page.getByTestId("online")).toHaveAttribute("data-phase", "idle");
  return page;
}

async function chatBothWays(host: Page, guest: Page): Promise<void> {
  for (const page of [host, guest]) {
    await expect(page.getByTestId("online-connected")).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("online-rtt")).toHaveText(/\d+ ms/, { timeout: 15_000 });
    await expect(page.getByTestId("online-same")).toHaveText("Both programs have the same cards.");
  }
  await host.getByTestId("online-chat-input").fill("hello from the host");
  await host.getByTestId("online-send").click();
  await expect(guest.getByTestId("online-chat")).toContainText("hello from the host");
  await guest.getByTestId("online-chat-input").fill("こんにちは");
  await guest.getByTestId("online-send").click();
  await expect(host.getByTestId("online-chat")).toContainText("こんにちは");
  // The host leaves: the guest is told.
  await host.getByTestId("online-leave").click();
  await expect(guest.getByTestId("online-closed")).toHaveText("The other player left.");
}

test("two programs connect with codes passed by hand, chat, and one leaves", async ({ browser }) => {
  test.setTimeout(120_000);
  const host = await openOnline(browser);
  const guest = await openOnline(browser);
  await host.locator(".sve-online-manual summary").click();
  await host.getByTestId("online-manual-host").click();
  const offer = await host.getByTestId("online-offer-code").inputValue({ timeout: 20_000 });
  expect(offer).toMatch(/^SVE1-O-/);

  // A wrong code is refused.
  await guest.locator(".sve-online-manual summary").click();
  await guest.getByTestId("online-offer-input").fill("not a code");
  await guest.getByTestId("online-manual-join").click();
  await expect(guest.getByTestId("online-error")).toContainText("isn't a connection code");

  await guest.locator(".sve-online-manual summary").click();
  await guest.getByTestId("online-offer-input").fill(offer);
  await guest.getByTestId("online-manual-join").click();
  const reply = await guest.getByTestId("online-reply-code").inputValue({ timeout: 20_000 });
  expect(reply).toMatch(/^SVE1-A-/);
  await host.getByTestId("online-reply-input").fill(reply);
  await host.getByTestId("online-connect").click();
  await expect(host.getByTestId("online-via")).toHaveText("codes passed by hand", { timeout: 30_000 });
  await chatBothWays(host, guest);
});

test("two programs meet in a room through the public relays", async ({ browser }) => {
  test.skip(!process.env.SVE_E2E_ONLINE, "needs the internet: SVE_E2E_ONLINE=1");
  test.setTimeout(180_000);
  const host = await openOnline(browser);
  const guest = await openOnline(browser);
  await host.getByTestId("online-host").click();
  const code = (await host.getByTestId("online-room-code").innerText()).trim();
  expect(code).toMatch(/^[A-Z2-9]{6}$/);
  await guest.getByTestId("online-code").fill(code.toLowerCase());
  const started = Date.now();
  await guest.getByTestId("online-join").click();
  // Both use the network the host selected.
  await expect(guest.getByTestId("online-via")).toBeVisible({ timeout: 120_000 });
  const via = await guest.getByTestId("online-via").innerText();
  await expect(host.getByTestId("online-via")).toHaveText(via);
  console.log(`connected via ${via} in ${Math.round((Date.now() - started) / 1000)} s`);
  await chatBothWays(host, guest);
});
