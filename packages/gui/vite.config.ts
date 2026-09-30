import react from "@vitejs/plugin-react";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import { hostPlugin } from "./host/plugin.ts";

const here = fileURLToPath(new URL(".", import.meta.url));

/**
 * A fingerprint of the rules code: the core (its source and card data) and the worker host that paces a game. Online, two
 * programs play one game only when theirs are the same (docs/online.md); line endings don't count.
 */
function engineFingerprint(): string {
  const hash = createHash("sha256");
  const walk = (root: string, dir: string) => {
    for (const name of readdirSync(dir).sort()) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(root, full);
      else if (/\.(ts|json)$/.test(name)) {
        hash.update(relative(root, full).split("\\").join("/"));
        hash.update(readFileSync(full, "utf8").replace(/\r\n/g, "\n"));
      }
    }
  };
  for (const dir of ["../core/src", "../core/data", "src/engine"]) walk(join(here, dir), join(here, dir));
  return hash.digest("hex").slice(0, 16);
}

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
 * The Android build's own files (docs/android.md): the page for a WebView too old for the app (capacitor.config.ts), and
 * the list of the resources built into the app, from the folder `bundle` (host/android.ts; none without it).
 */
function androidFiles(bundle: string | null): Plugin {
  return {
    name: "sve-android-files",
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "webview-old.html", source: readFileSync(join(here, "src/host/webview-old.html"), "utf8") });
      this.emitFile({ type: "asset", fileName: "bundled-resources.json", source: JSON.stringify(bundle ? filesUnder(bundle) : []) });
    },
  };
}

// `npm run dev:gui` (repository root) starts this dev server and opens the browser (its --open flag; a plain `vite`, as the
// end-to-end tests run it, opens nothing). SVE_GUI_PORT changes the port (default 5173, or the next free one).
// `vite build --mode android` builds the Android app's web part (docs/android.md): without public/ (the player's own files
// are on the phone, in the app's folder), into dist-android/ for Capacitor. SVE_BUNDLE_PUBLIC names a folder of resources
// to build into the app instead (a release with resources: scripts/android-apk.mjs --public).
export default defineConfig(({ mode }) => {
  const android = mode === "android";
  const bundle = android ? process.env.SVE_BUNDLE_PUBLIC || null : null;
  return {
    plugins: [react(), hostPlugin(), ...(android ? [androidFiles(bundle)] : [])],
    server: {
      port: Number(process.env.SVE_GUI_PORT ?? 5173),
      // Not the builds' output: an APK build writes thousands of files there (with resources, hundreds of MB), whose
      // watching can fail on a file still being written and stop the server, and whose HTML files reload open pages.
      watch: { ignored: ["**/dist/**", "**/dist-android/**", "**/android/**"] },
    },
    worker: { format: "es" },
    publicDir: android ? (bundle ?? false) : "public",
    build: { target: "es2022", chunkSizeWarningLimit: 10_000, outDir: android ? "dist-android" : "dist" },
    define: { __ENGINE_FINGERPRINT__: JSON.stringify(engineFingerprint()) },
    // Online play loads when first opened (src/online): its libraries are prepared when the server starts, else the dev
    // server finds them only then and reloads every open page. The libraries are found from the app's page only, not from
    // the pages of the builds' output (dist-android/, android/).
    optimizeDeps: { entries: ["index.html"], include: ["trystero", "@trystero-p2p/mqtt", "@trystero-p2p/torrent"] },
  };
});
