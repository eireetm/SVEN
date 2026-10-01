import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The core must stay pure, deterministic and host-independent: no hidden
 * randomness, clocks, IO or host APIs. The tsconfig already excludes DOM and Node types; this
 * test catches the ES built-ins that the type checker cannot forbid.
 */
const SRC = join(__dirname, "..", "src");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : p.endsWith(".ts") ? [p] : [];
  });
}

const FORBIDDEN: [RegExp, string][] = [
  [/Math\.random/, "use the game RNG (rng/rng.ts)"],
  [/\bDate\b/, "no clocks: time must not influence the game"],
  [/performance\.now/, "no clocks"],
  [/\bprocess\./, "no Node process access"],
  [/from\s+["']node:/, "no Node built-in modules"],
  [/\brequire\(/, "no CommonJS / dynamic loading"],
  [/\bsetTimeout\b|\bsetInterval\b/, "no timers"],
  [/\bstructuredClone\b/, "use util/json cloneJson (host independent)"],
];

describe("architecture", () => {
  for (const file of files(SRC)) {
    const rel = file.slice(SRC.length + 1).replaceAll("\\", "/");
    it(`${rel} uses no forbidden APIs`, () => {
      const code = readFileSync(file, "utf8").replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, "");
      for (const [re, why] of FORBIDDEN) expect(re.test(code), `${rel}: ${re} — ${why}`).toBe(false);
    });
  }
});
