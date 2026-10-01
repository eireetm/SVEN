import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Bots must be reproducible (a bot's choices depend only on its seed and on what its player sees)
 * and play through the core's public API only, so they can't read hidden cards and don't break
 * when the engine's internals change.
 */
const SRC = join(__dirname, "..", "src");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : p.endsWith(".ts") ? [p] : [];
  });
}

const FORBIDDEN: [RegExp, string][] = [
  [/Math\.random/, "use a seeded RNG (seedRng from the core)"],
  [/\bDate\b/, "no clocks: budgets are counts, not time"],
  [/performance\.now/, "no clocks: budgets are counts, not time"],
  [/\bprocess\./, "no Node process access"],
  [/from\s+["']node:/, "no Node built-in modules"],
  [/\bsetTimeout\b|\bsetInterval\b/, "no timers"],
];

describe("bot architecture", () => {
  for (const file of files(SRC)) {
    const rel = file.slice(SRC.length + 1).replaceAll("\\", "/");
    it(`${rel} uses no forbidden APIs and only the core's public API`, () => {
      const code = readFileSync(file, "utf8").replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, "");
      for (const [re, why] of FORBIDDEN) expect(re.test(code), `${rel}: ${re} — ${why}`).toBe(false);
      const coreImports = [...code.matchAll(/from\s+["']([^"']*core[^"']*)["']/g)].map((m) => m[1]);
      const allowed = rel === "core.ts" ? ["../../core/src/index"] : ["./core"];
      for (const path of coreImports) expect(allowed, `${rel} imports ${path}`).toContain(path);
    });
  }
});
