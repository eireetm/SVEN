import type { CapacitorConfig } from "@capacitor/cli";

// The phone and tablet apps: the same web app in the device's web view — Android's system WebView, served from
// https://localhost, and iOS's WKWebView, from capacitor://localhost (secure contexts: online play needs one). Built by
// `npm run android:apk` and `npm run ios:ipa` (repository root); each builds its own web part (vite --mode android / ios)
// and says which (SVE_APP=ios: dist-ios/).
const config: CapacitorConfig = {
  appId: "local.sve.next",
  appName: "SVE NEXT",
  webDir: process.env.SVE_APP === "ios" ? "dist-ios" : "dist-android",
  android: {
    // The oldest WebView (the Chrome inside it) the app runs on: CSS aspect-ratio (88), Object.hasOwn in online play (93),
    // the "deflate-raw" compression of connection codes (103). With an older one, the error page below says so.
    minWebViewVersion: 103,
  },
  ios: {
    // The page doesn't bounce or scroll as a whole (its own panels scroll); the safe areas are the page's (index.html).
    scrollEnabled: false,
  },
  server: { errorPath: "webview-old.html" },
};

export default config;
