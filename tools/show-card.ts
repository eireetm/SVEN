/**
 * Print everything needed to script a card: all printings, EN / JA / CN text, stats,
 * Japanese traits, related definitions (same name: base / evolved card), token definitions
 * named in the text, official rulings (Japanese Q&A, from the scraped assets, or a pre-release set's data file —
 * data/preview.ts) and the script status.
 *
 *   npm run card -- BP01-006 BP01-SL01 ...     # canonical ids or any printing number
 *   npm run card -- --assets <dir> BP01-006    # assets directory (default ../assets)
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createEngine, type CardDefinition } from "../packages/core/src";
import { PREVIEW_SETS, previewRawCards, type PreviewSetFile } from "../packages/core/src/data/preview";
import type { RawCardJson } from "../packages/core/src/data/raw";
import { ALL_CARDS, ALL_SCRIPTS } from "../packages/core/src/sets";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const assetsAt = args.indexOf("--assets");
const assetsDir = resolve(
  assetsAt >= 0 ? args.splice(assetsAt, 2)[1]! : (process.env.SVE_ASSETS ?? join(repoRoot, "..", "assets")),
);
if (args.length === 0) {
  console.error("usage: npm run card -- <card number> [...]");
  process.exit(1);
}

const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });
const db = engine.db;

/** Printings of the pre-release sets' data files (data/preview.ts), read when first needed. */
let previews: Map<string, RawCardJson> | null = null;
function previewRaw(printing: string): RawCardJson | null {
  if (!previews) {
    previews = new Map();
    for (const { file: fileName } of Object.values(PREVIEW_SETS)) {
      const file = join(assetsDir, "..", fileName);
      if (!existsSync(file)) continue;
      for (const r of previewRawCards(JSON.parse(readFileSync(file, "utf8")) as PreviewSetFile)) previews.set(r.card_no, r);
    }
  }
  return previews.get(printing) ?? null;
}

function raw(printing: string): RawCardJson | null {
  const file = join(assetsDir, printing, `${printing}.json`);
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as RawCardJson) : previewRaw(printing);
}

function stats(c: CardDefinition): string {
  const kind = [c.type, c.evolved ? "evolved" : "", c.advanced ? "advanced" : "", c.token ? "token" : ""].filter(Boolean).join(" ");
  const nums = [c.cost === null ? "" : `cost ${c.cost}`, c.attack === null ? "" : `${c.attack}/${c.defense}`];
  return [kind, c.class, ...nums.filter(Boolean), `traits ${JSON.stringify(c.traits)}`].join(" | ");
}

for (const ref of args) {
  const def = db.has(ref) ? db.get(ref) : db.hasPrinting(ref) ? db.ofPrinting(ref) : null;
  if (!def) {
    console.log(`\n### ${ref}: unknown card number (not in the built card data)`);
    continue;
  }
  const status = engine.implementationStatus(def.id);
  const setDir = def.id.split("-")[0]!;
  console.log(`\n### ${def.id} ${def.name} / ${def.names.ja ?? ""} / ${def.names.cn ?? ""}`);
  // CR 2.14 — a back face has no printings of its own: it is the back of its front's printings.
  const physical = def.frontFace ? db.get(def.frontFace) : def;
  console.log(def.frontFace ? `back face of ${def.frontFace} (printings: ${physical.printings.join(" ")})` : `printings: ${def.printings.join(" ")}`);
  for (const [p, n] of Object.entries(def.alternateNames ?? {})) console.log(`alternate name (CR 2.13) on ${p}: ${n.en} / ${n.ja ?? ""}`);
  console.log(stats(def));
  console.log(`script: ${status}${status === "vanilla" ? "" : ` — packages/core/src/script/${setDir}/${def.id}.ts`}`);
  console.log(`\n[EN]\n${def.text.en || "(no text)"}\n\n[JA]\n${def.text.ja ?? ""}\n\n[CN]\n${def.text.cn ?? ""}`);

  const faces = [def.backFace, def.frontFace].filter((id): id is string => id !== undefined).map((id) => db.get(id));
  const related = [...faces, ...db.named(def.name).filter((d) => d.id !== def.id)];
  const tokens = db.all().filter((d) => d.token && d.id !== def.id && def.text.en.includes(d.name));
  for (const r of [...related, ...tokens]) console.log(`\nrelated: ${r.id} ${r.name} — ${stats(r)}\n  ${r.text.en.replace(/\n/g, "\n  ")}`);

  const seen = new Set<string>();
  const rulings = physical.printings.flatMap((p) => (raw(p)?.rulings ?? []).filter((q) => !seen.has(q.q) && seen.add(q.q)));
  console.log(`\nrulings (${rulings.length}):`);
  rulings.forEach((q, i) => console.log(`  Q${i + 1}. ${q.q}\n  A${i + 1}. ${q.a}`));
}
