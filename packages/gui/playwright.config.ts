import { defineConfig } from "@playwright/test";

// End-to-end tests of the GUI (`npm run test:gui` at the repository root). They start their own dev server and drive the
// browser installed on this machine (Chrome by default; SVE_E2E_CHANNEL=msedge for Edge), so no browser download is needed.
const port = Number(process.env.SVE_E2E_PORT ?? 5199);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 180_000,
  expect: { timeout: 30_000 },
  reporter: "list",
  use: {
    baseURL: `http://localhost:${port}`,
    channel: process.env.SVE_E2E_CHANNEL ?? "chrome",
    headless: process.env.SVE_E2E_HEADED !== "1",
    viewport: { width: 1600, height: 900 },
  },
  webServer: {
    command: `npx vite --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
