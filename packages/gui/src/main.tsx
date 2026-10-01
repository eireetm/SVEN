import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/app.css";
import { App } from "./app/App";
import { showCrash } from "./app/crash";
import { loadSettingsFile } from "./app/settings-file";
import { setHost } from "./host/api";
import { webHost } from "./host/web";

// The code could be read: index.html's page for a WebView too old for it isn't needed.
(window as { sveStarted?: boolean }).sveStarted = true;

/**
 * The Android app first sets up its host: its files are on the phone. A computer uses the `/api`. Then the PC release's
 * settings file, before anything is shown in the browser's settings.
 */
async function start(): Promise<void> {
  if (import.meta.env.MODE === "android") {
    const { createAndroidHost, installAndroidShell } = await import("./host/android");
    setHost(await createAndroidHost());
    await installAndroidShell();
    document.documentElement.dataset.platform = "android";
  } else {
    setHost(webHost);
  }
  await loadSettingsFile();
  createRoot(document.getElementById("root")!, {
    // React removes everything on an error nothing catches: say so rather than leave an empty page (crash.ts).
    onUncaughtError: (error, info) => {
      console.error(error);
      showCrash(error, info.componentStack);
    },
  }).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

start().catch((error: unknown) => {
  console.error(error);
  showCrash(error);
});
