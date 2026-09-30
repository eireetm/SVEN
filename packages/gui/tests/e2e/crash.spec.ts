import { expect, test } from "@playwright/test";
import { useSettings } from "./helpers";

// When the interface fails (src/app/crash.ts), a page says so instead of an empty screen: in three languages, with the
// error and a reload button. The failure here is the one a page translator or an extension causes: React removes a node
// that is no longer where React put it. The page also tells browsers not to translate it (index.html).

test("a failing interface shows what happened and how to get back, not an empty page", async ({ page }) => {
  await useSettings(page, { uiLang: "en" });
  await page.goto("/");
  await expect(page.getByTestId("menu-settings")).toBeVisible({ timeout: 120_000 });
  expect(await page.locator("html").getAttribute("translate")).toBe("no");

  // The next node React removes from the interface was taken away by someone else.
  await page.evaluate(`(() => {
    const original = Node.prototype.removeChild;
    Node.prototype.removeChild = function (child) {
      if (this instanceof Element && this.closest("#root")) {
        Node.prototype.removeChild = original;
        throw new DOMException("Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.", "NotFoundError");
      }
      return original.call(this, child);
    };
  })()`);
  await page.getByTestId("menu-settings").click();

  const crash = page.getByTestId("crash");
  await expect(crash).toBeVisible();
  for (const text of ["界面出错了", "The interface stopped working", "画面でエラーが起きました", "NotFoundError"]) await expect(crash).toContainText(text);
  await page.getByTestId("crash-reload").click();
  await expect(page.getByTestId("menu-settings")).toBeVisible({ timeout: 120_000 });
  await expect(page.getByTestId("crash")).toHaveCount(0);
});
