import react from "@vitejs/plugin-react";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
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

// `npm run dev:gui` (repository root) starts this dev server and opens the browser (its --open flag; a plain `vite`, as the
// end-to-end tests run it, opens nothing). SVE_GUI_PORT changes the port (default 5173, or the next free one).
export default defineConfig({
  plugins: [react(), hostPlugin()],
  server: {
    port: Number(process.env.SVE_GUI_PORT ?? 5173),
  },
  worker: { format: "es" },
  build: { target: "es2022", chunkSizeWarningLimit: 10_000 },
  define: { __ENGINE_FINGERPRINT__: JSON.stringify(engineFingerprint()) },
  // Online play loads when first opened (src/online): its libraries are prepared when the server starts, else the dev
  // server finds them only then and reloads every open page.
  optimizeDeps: { include: ["trystero", "@trystero-p2p/mqtt", "@trystero-p2p/torrent"] },
});
