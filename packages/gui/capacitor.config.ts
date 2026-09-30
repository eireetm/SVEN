import type { CapacitorConfig } from "@capacitor/cli";

// The Android app (docs/android.md): the same web app in the phone's system WebView, served from https://localhost (a
// secure context: online play needs it). Built by `npm run android:apk` (repository root).
const config: CapacitorConfig = {
  appId: "local.sve.next",
  appName: "SVE NEXT",
  webDir: "dist-android",
};

export default config;
