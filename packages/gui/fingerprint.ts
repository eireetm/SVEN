import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * A fingerprint of the rules code: the core (its source and card data) and the worker host that paces a game. Online, two
 * programs play one game only when theirs are the same (docs/online.md); line endings don't count. `gui` is packages/gui.
 * vite.config.ts builds it into the app; scripts/release-pc.ts writes it into a release's VERSION.txt.
 */
export function engineFingerprint(gui: string): string {
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
  for (const dir of ["../core/src", "../core/data", "src/engine"]) walk(join(gui, dir), join(gui, dir));
  return hash.digest("hex").slice(0, 16);
}
