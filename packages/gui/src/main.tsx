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
 * The Android and iOS apps first set up their host: their files are on the device. A computer uses the `/api`. Then the PC release's
 * settings file, before anything is shown in the browser's settings.
 */
async function start(): Promise<void> {
  const app = import.meta.env.MODE;
  if (app === "android" || app === "ios") {
    const { createNativeHost, installNativeShell } = await import("./host/native");
    setHost(await createNativeHost(app));
    await installNativeShell(app);
    document.documentElement.dataset.platform = app;
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
