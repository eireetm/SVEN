/**
 * Extract the clause numbers (and section titles) of the Comprehensive Rules PDF into
 * tools/data/cr-clauses.json. Only numbers and short titles are stored, not the rules text.
 *
 *   npm run rules:clauses                       # newest ../rules/*.pdf
 *   npm run rules:clauses -- --pdf <file> --pdftotext <exe>
 *
 * Needs `pdftotext` (poppler; Git for Windows ships one in mingw64/bin).
 * When the rules are updated, re-run this and `npm run rules:index`: citations of clauses
 * that no longer exist fail the citation test, and git diff of the JSON shows what changed.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function findPdf(): string {
  const explicit = arg("pdf");
  if (explicit) return resolve(explicit);
  const dir = join(repoRoot, "..", "rules");
  const pdfs = readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".pdf")).sort();
  if (pdfs.length === 0) throw new Error(`no PDF in ${dir}`);
  return join(dir, pdfs[pdfs.length - 1]!);
}

function findPdftotext(): string {
  const candidates = [
    arg("pdftotext"),
    process.env.PDFTOTEXT,
    "C:\\Program Files\\Git\\mingw64\\bin\\pdftotext.exe",
    "pdftotext",
  ].filter((x): x is string => !!x);
  return candidates.find((c) => c === "pdftotext" || existsSync(c))!;
}

const pdf = findPdf();
const text = execFileSync(findPdftotext(), ["-enc", "UTF-8", pdf, "-"], { encoding: "utf8", maxBuffer: 64 << 20 })
  .replace(/\s+/g, " ");

const version = /Ver\.\s*([\d.]+)/.exec(text)?.[1] ?? "unknown";
const clauses = new Set<string>();
for (const m of text.matchAll(/(?<![\d.])(\d{1,2}(?:\.\d{1,2}){1,6})\.\s/g)) clauses.add(m[1]!);
for (const m of text.matchAll(/(?<![\d.])(\d{1,2})\.\s[A-Z][A-Za-z-]+/g)) clauses.add(m[1]!);
for (const c of [...clauses]) if (c.split(".")[0] === "0") clauses.delete(c); // e.g. "... to 0. "

const sections: Record<string, string> = {};
for (const m of text.matchAll(/(?<![\d.])(\d{1,2}\.\d{1,2})\. (.{2,70}?) \1\.1\./g)) {
  sections[m[1]!] ??= m[2]!.trim();
}

const byNumber = (a: string, b: string) => {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? -1) - (pb[i] ?? -1);
    if (d !== 0) return d;
  }
  return 0;
};

const out = {
  version,
  source: basename(pdf),
  sections: Object.fromEntries(Object.entries(sections).sort(([a], [b]) => byNumber(a, b))),
  clauses: [...clauses].sort(byNumber),
};
writeFileSync(join(repoRoot, "tools", "data", "cr-clauses.json"), JSON.stringify(out, null, 1) + "\n", "utf8");
console.log(`CR ${version}: ${out.clauses.length} clause numbers, ${Object.keys(out.sections).length} sections -> tools/data/cr-clauses.json`);
