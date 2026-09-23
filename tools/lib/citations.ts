import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Find Comprehensive Rules clause numbers cited in source files ("CR 8.4.3.1", "(10.6.2.3)",
 * "12.8.2 (iii)", ...). Numbers are recognised by shape; chapter must be 1–15 and later
 * components 1–2 digits, which excludes ordinary decimals such as 0.8.
 */
export interface Citation {
  clause: string;
  file: string;
  line: number;
}

const CLAUSE = /(?<![\w.])((?:1[0-5]|[1-9])(?:\.\d{1,2}){1,5})(?![\w]|\.\d)/g;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".ts") ? [p] : [];
  });
}

export function scanCitations(root: string, dirs: readonly string[]): Citation[] {
  const out: Citation[] = [];
  for (const dir of dirs) {
    for (const file of walk(join(root, dir))) {
      const rel = relative(root, file).replaceAll("\\", "/");
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((text, i) => {
          for (const m of text.matchAll(CLAUSE)) out.push({ clause: m[1]!, file: rel, line: i + 1 });
        });
    }
  }
  return out;
}

export interface ClauseList {
  version: string;
  source: string;
  sections: Record<string, string>;
  clauses: string[];
}

export function loadClauses(root: string): ClauseList {
  return JSON.parse(readFileSync(join(root, "docs", "cr-clauses.json"), "utf8")) as ClauseList;
}

export function compareClauses(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? -1) - (pb[i] ?? -1);
    if (d !== 0) return d;
  }
  return 0;
}

export const CITATION_DIRS = ["packages/core/src", "packages/core/test"] as const;
