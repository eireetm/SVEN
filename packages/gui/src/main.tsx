import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/app.css";
import { App } from "./app/App";
import { setHost } from "./host/api";
import { webHost } from "./host/web";

/** The Android app (docs/android.md) first sets up its host: its files are on the phone. A computer uses the `/api`. */
async function start(): Promise<void> {
  if (import.meta.env.MODE === "android") {
    const { createAndroidHost, installAndroidShell } = await import("./host/android");
    setHost(await createAndroidHost());
    await installAndroidShell();
    document.documentElement.dataset.platform = "android";
  } else {
    setHost(webHost);
  }
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void start();
