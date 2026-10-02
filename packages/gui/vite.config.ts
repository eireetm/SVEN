import react from "@vitejs/plugin-react";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import { engineFingerprint } from "./fingerprint.ts";
import { hostPlugin } from "./host/plugin.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
/** The program's version (package.json), shown in the main menu and told to the other program online (src/app/version.ts). */
const version = (JSON.parse(readFileSync(join(here, "package.json"), "utf8")) as { version: string }).version;

/** Every file under `dir` ("images/cards/BP01-001.webp"), hidden files left out. */
function filesUnder(dir: string, prefix = ""): string[] {
  const out: string[] = [];
  for (const name of readdirSync(join(dir, prefix)).sort()) {
    if (name.startsWith(".")) continue;
    const path = prefix ? `${prefix}/${name}` : name;
    if (statSync(join(dir, path)).isDirectory()) out.push(...filesUnder(dir, path));
    else out.push(path);
  }
  return out;
}

/**
 * The apps' own files (Android, iOS): the page for a web view too old for the app (capacitor.config.ts), and the list of
 * the resources built into the app, from the folder `bundle` (host/native.ts; none without it).
 */
function appFiles(bundle: string | null): Plugin {
  return {
    name: "sve-app-files",
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "webview-old.html", source: readFileSync(join(here, "src/host/webview-old.html"), "utf8") });
      this.emitFile({ type: "asset", fileName: "bundled-resources.json", source: JSON.stringify(bundle ? filesUnder(bundle) : []) });
    },
  };
}

// `npm run dev:gui` (repository root) starts this dev server and opens the browser (its --open flag; a plain `vite`, as the
// end-to-end tests run it, opens nothing). SVE_GUI_PORT changes the port (default 5173, or the next free one).
// `vite build --mode android` (or `--mode ios`) builds the Android (iOS) app's web part: without public/ (the player's own
// files are on the device, in the app's folder), into dist-android/ (dist-ios/) for Capacitor. SVE_BUNDLE_PUBLIC names a
// folder of resources to build into the app instead (a release with resources: scripts/android-apk.mjs --public).
export default defineConfig(({ mode }) => {
  const app = mode === "android" || mode === "ios";
  const bundle = app ? process.env.SVE_BUNDLE_PUBLIC || null : null;
  return {
    plugins: [react(), hostPlugin(), ...(app ? [appFiles(bundle)] : [])],
    server: {
      port: Number(process.env.SVE_GUI_PORT ?? 5173),
      // Not the builds' output: an APK build writes thousands of files there (with resources, hundreds of MB), whose
      // watching can fail on a file still being written and stop the server, and whose HTML files reload open pages.
      watch: { ignored: ["**/dist/**", "**/dist-android/**", "**/dist-ios/**", "**/android/**", "**/ios/**"] },
    },
    worker: { format: "es" },
    publicDir: app ? (bundle ?? false) : "public",
    build: { target: "es2022", chunkSizeWarningLimit: 10_000, outDir: app ? `dist-${mode}` : "dist" },
    define: { __ENGINE_FINGERPRINT__: JSON.stringify(engineFingerprint(here)), __APP_VERSION__: JSON.stringify(version) },
    // Online play loads when first opened (src/online): its libraries are prepared when the server starts, else the dev
    // server finds them only then and reloads every open page. The libraries are found from the app's page only, not from
    // the pages of the builds' output (dist-android/, android/).
    optimizeDeps: { entries: ["index.html"], include: ["trystero", "@trystero-p2p/mqtt", "@trystero-p2p/torrent"] },
  };
});
