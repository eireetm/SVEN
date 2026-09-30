import type { CapacitorConfig } from "@capacitor/cli";

// The Android app (docs/android.md): the same web app in the phone's system WebView, served from https://localhost (a
// secure context: online play needs it). Built by `npm run android:apk` (repository root).
const config: CapacitorConfig = {
  appId: "local.sve.next",
  appName: "SVE NEXT",
  webDir: "dist-android",
  android: {
    // The oldest WebView (the Chrome inside it) the app runs on: CSS aspect-ratio (88), Object.hasOwn in online play (93),
    // the "deflate-raw" compression of connection codes (103). With an older one, the error page below says so.
    minWebViewVersion: 103,
  },
  server: { errorPath: "webview-old.html" },
};

export default config;
