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
    return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(p) ? [p] : [];
  });
}

/** A directory to scan; `commentsOnly` for code with ordinary decimals (the bot's weights). */
export interface CitationDir {
  path: string;
  commentsOnly?: boolean;
}

/** The comment part of a line: after "//", or the whole line inside a block comment ("*" lines). */
function commentText(line: string): string {
  const slash = line.indexOf("//");
  if (slash >= 0) return line.slice(slash + 2);
  const t = line.trimStart();
  return t.startsWith("*") || t.startsWith("/*") ? line : "";
}

export function scanCitations(root: string, dirs: readonly (string | CitationDir)[]): Citation[] {
  const out: Citation[] = [];
  for (const entry of dirs) {
    const dir = typeof entry === "string" ? { path: entry } : entry;
    for (const file of walk(join(root, dir.path))) {
      const rel = relative(root, file).replaceAll("\\", "/");
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, i) => {
          const text = dir.commentsOnly ? commentText(line) : line;
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
  return JSON.parse(readFileSync(join(root, "tools", "data", "cr-clauses.json"), "utf8")) as ClauseList;
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

export const CITATION_DIRS: readonly CitationDir[] = [
  { path: "packages/core/src" },
  { path: "packages/core/test" },
  // Bot code has ordinary decimals (evaluation weights such as 1.5); only its comments cite rules.
  { path: "packages/bot/src", commentsOnly: true },
  { path: "packages/bot/test", commentsOnly: true },
  // The GUI works out no rules, but its comments say which rule a display follows.
  { path: "packages/gui/src", commentsOnly: true },
];
