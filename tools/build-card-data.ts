/**
 * Compile scraped card files into the normalized per-set JSON bundled with @sve/core.
 *
 *   npm run build:cards                 # uses ../assets (i.e. D:\SVE\assets)
 *   npm run build:cards -- --assets <dir> --set BP01
 *
 * The core package never reads the file system; this tool is the only place that does.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { groupPrintings, normalizePrinting } from "../packages/core/src/data/normalize";
import type { RawCardJson } from "../packages/core/src/data/raw";
import { CardDatabase } from "../packages/core/src/data/database";
import { CARD_SET_FORMAT, type CardSetFile } from "../packages/core/src/data/set-file";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** Sets currently supported, in release order (earlier set wins canonical printing). */
const SET_ORDER = ["BP01"];

const assetsDir = resolve(arg("assets") ?? process.env.SVE_ASSETS ?? join(repoRoot, "..", "assets"));
const sets = arg("set") ? [arg("set")!] : SET_ORDER;
const outDir = join(repoRoot, "packages", "core", "data");

if (!existsSync(assetsDir)) {
  console.error(`assets directory not found: ${assetsDir}`);
  process.exit(1);
}

for (const set of sets) {
  const folders = readdirSync(assetsDir).filter((f) => f.startsWith(`${set}-`)).sort();
  const warnings: string[] = [];
  const printings = folders.map((folder) => {
    const file = join(assetsDir, folder, `${folder}.json`);
    const raw = JSON.parse(readFileSync(file, "utf8")) as RawCardJson;
    if (raw.card_no !== folder) throw new Error(`${file}: card_no ${raw.card_no} does not match folder`);
    if (!existsSync(join(assetsDir, folder, raw.image))) warnings.push(`${folder}: image file ${raw.image} missing`);
    if (!raw.name_cn) warnings.push(`${folder}: missing Chinese name`);
    if (raw.effect_en && !raw.effect_cn) warnings.push(`${folder}: missing Chinese text`);
    return normalizePrinting(raw);
  });

  const { cards, textVariants } = groupPrintings(printings, SET_ORDER);
  new CardDatabase(cards); // index validation (duplicate printings, token names, ...)
  for (const v of textVariants) {
    warnings.push(
      `${v.variant}: English text differs from canonical ${v.canonical} (canonical text is used)\n` +
        `      canonical: ${JSON.stringify(v.canonicalText)}\n      variant:   ${JSON.stringify(v.variantText)}`,
    );
  }

  const file: CardSetFile = { format: CARD_SET_FORMAT, set, printings: printings.length, cards };
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `${set}.json`);
  writeFileSync(outFile, JSON.stringify(file, null, 1) + "\n", "utf8");

  const altGroups = cards.filter((c) => c.printings.length > 1);
  console.log(`${set}: ${printings.length} printings -> ${cards.length} definitions (${altGroups.length} with alternate printings)`);
  console.log(`  written ${outFile}`);
  for (const w of warnings) console.log(`  warning: ${w}`);
}
