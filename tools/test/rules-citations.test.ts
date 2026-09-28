import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CITATION_DIRS, loadClauses, scanCitations } from "../lib/citations";

// These scan every source file: about a second alone, much longer while the whole suite runs in parallel.
const SCAN_TIMEOUT = 60_000;

/**
 * CLAUDE.md: every rule decision must name its Comprehensive Rules clause. This test makes
 * sure every cited clause exists in the current rules (docs/cr-clauses.json), so a rules
 * update that renumbers or removes clauses cannot silently leave stale citations behind.
 */
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

describe("Comprehensive Rules citations", () => {
  it("every clause cited in the core exists in the current rules", () => {
    const known = new Set(loadClauses(root).clauses);
    const unknown = scanCitations(root, CITATION_DIRS)
      .filter((c) => !known.has(c.clause))
      .map((c) => `${c.file}:${c.line} cites ${c.clause}`);
    expect(unknown).toEqual([]);
  }, SCAN_TIMEOUT);

  it("finds citations in the engine", () => {
    const cited = new Set(scanCitations(root, CITATION_DIRS).map((c) => c.clause));
    for (const clause of ["6.2.1.8", "7.2.4.1", "8.4.3.1", "10.5.2.2", "11.3.2", "12.2.3", "5.16.1.2"]) {
      expect(cited.has(clause), clause).toBe(true);
    }
  }, SCAN_TIMEOUT);
});
