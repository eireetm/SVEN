/**
 * Compile the scraped card files into the normalized per-set JSON bundled with @sve/core.
 *
 *   npm run build:cards                   # uses ../assets (i.e. D:\SVE\assets)
 *   npm run build:cards -- --assets <dir>
 *
 * Every printing of every set is read, so that alternate printings in other sets (promos,
 * reprints, special art) join their card's definition. Only cards with a printing in a
 * supported set (SUPPORTED_SETS) become definitions; each is written to the data file of its
 * canonical printing's set. Also writes docs/card-data-report.md.
 *
 * The core package never reads the file system; this tool is the only place that does.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CardDataError, groupPrintings, normalizePrinting, type NormalizedPrinting } from "../packages/core/src/data/normalize";
import { applyDataFixes, DATA_FIXES } from "../packages/core/src/data/fixes";
import type { RawCardJson } from "../packages/core/src/data/raw";
import { CardDatabase } from "../packages/core/src/data/database";
import { CARD_SET_FORMAT, type CardSetFile } from "../packages/core/src/data/set-file";
import { SUPPORTED_SETS } from "../packages/core/src/sets/supported";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const assetsDir = resolve(arg("assets") ?? process.env.SVE_ASSETS ?? join(repoRoot, "..", "assets"));
const outDir = join(repoRoot, "packages", "core", "data");
if (!existsSync(assetsDir)) {
  console.error(`assets directory not found: ${assetsDir}`);
  process.exit(1);
}

const supported = new Set<string>(SUPPORTED_SETS);
const warnings: string[] = [];
const skipped: { printing: string; reason: string }[] = [];
/** Evolution point / super-evolution point cards: markers for the points (CR 3.2), not game cards. */
const markers: string[] = [];
const raws = new Map<string, RawCardJson>();
const printings: NormalizedPrinting[] = [];
/** Data errors of supported sets' printings, reported together. */
const errors: string[] = [];

for (const folder of readdirSync(assetsDir).sort()) {
  const file = join(assetsDir, folder, `${folder}.json`);
  if (!existsSync(file)) continue;
  const raw = applyDataFixes(JSON.parse(readFileSync(file, "utf8")) as RawCardJson);
  if (raw.card_no !== folder) throw new Error(`${file}: card_no ${raw.card_no} does not match folder`);
  if (raw.card_type.some((t) => t === "Evolution Point" || t === "Super-Evolution Point")) {
    markers.push(folder);
    continue;
  }
  raws.set(folder, raw);
  try {
    printings.push(normalizePrinting(raw));
  } catch (e) {
    // Cards of sets that are not supported yet may use card types the engine does not model
    // (Crest, Equipment, Advanced, evolution point cards ...); they cannot be alternate
    // printings of supported cards, so they are only listed in the report.
    if (!(e instanceof CardDataError)) throw e;
    if (supported.has(raw.set)) errors.push(e.message);
    else skipped.push({ printing: folder, reason: e.message.slice(folder.length + 2) });
  }
}
if (errors.length > 0) throw new CardDataError(`${errors.length} card data error(s):\n${errors.join("\n")}`);

const { cards, setOf, textVariants, noEnglishText, officialMismatches, japaneseVariants } = groupPrintings(printings, SUPPORTED_SETS);
new CardDatabase(cards); // index validation (duplicate printings, unique token names, ...)

for (const c of cards) {
  if (c.frontFace !== undefined) continue; // a back face (CR 2.14): checked with its front
  for (const p of c.printings) {
    const raw = raws.get(p)!;
    if (!existsSync(join(assetsDir, p, raw.image))) warnings.push(`${p}: image file ${raw.image} missing`);
    if (raw.back && !existsSync(join(assetsDir, p, raw.back.image))) warnings.push(`${p}: image file ${raw.back.image} missing`);
  }
  // The definition shows the canonical printing's texts, so only its gaps matter.
  const raw = raws.get(c.id)!;
  if (!raw.name_cn) warnings.push(`${c.id}: missing Chinese name`);
  if (raw.effect_ja && !raw.effect_cn) warnings.push(`${c.id}: missing Chinese text`);
}

// CR 5.16.1.1.1 — an evolved card has its base card's name, unless a card evolves a follower "into" it by name (the
// double-faced cards, BP09-038). An evolved card matching neither can never be used: usually a misspelt English name.
const EVOLVED_UNDER_OTHER_NAMES = new Set(["BP03-058", "BP04-061", "BP04-062"]); // the Lævateinn Dragon forms (data/fixes.ts)
const baseNames = new Set(cards.filter((c) => !c.evolved && c.frontFace === undefined).map((c) => c.name));
const allEnglish = cards.map((c) => c.text.en).join("\n");
for (const c of cards) {
  if (!c.evolved || c.frontFace !== undefined || baseNames.has(c.name) || EVOLVED_UNDER_OTHER_NAMES.has(c.id)) continue;
  if (!allEnglish.includes(c.name)) warnings.push(`${c.id}: evolved card "${c.name}" has no base card of the same name (CR 5.16.1.1.1)`);
}

mkdirSync(outDir, { recursive: true });
const summary: string[] = [];
for (const set of SUPPORTED_SETS) {
  const defs = cards.filter((c) => setOf[c.id] === set);
  const file: CardSetFile = { format: CARD_SET_FORMAT, set, printings: defs.reduce((n, c) => n + c.printings.length, 0), cards: defs };
  writeFileSync(join(outDir, `${set}.json`), JSON.stringify(file, null, 1) + "\n", "utf8");
  const own = defs.flatMap((c) => c.printings).filter((p) => raws.get(p)!.set === set).length;
  const alt = defs.filter((c) => c.printings.length > 1).length;
  const line = `${set}: ${own} printings of the set + ${file.printings - own} in other sets -> ${defs.length} definitions (${alt} with several printings)`;
  summary.push(line);
  console.log(line);
}

// Report ---------------------------------------------------------------------------------
const bySet = (id: string) => setOf[id] ?? "?";
const reasons = new Map<string, string[]>();
for (const s of skipped) {
  const key = s.reason.replace(/"[^"]*"/g, '"…"').replace(/\(cost=.*\)$/, "").trim();
  reasons.set(key, [...(reasons.get(key) ?? []), s.printing]);
}
const report = [
  "# 卡牌数据构建报告",
  "",
  "由 `npm run build:cards` 生成，勿手改。",
  "",
  `- 读取印刷版本：${raws.size}（另有 ${markers.length} 张进化点 / 超进化点标记卡，不是游戏用卡，已跳过）；已支持的卡包：${SUPPORTED_SETS.join("、")}`,
  ...summary.map((s) => `- ${s}`),
  `- 数据修正表（\`data/fixes.ts\`）：${Object.keys(DATA_FIXES).length} 条`,
  "",
  "## 各印刷版本之间英文文本差异较大的",
  "",
  "以规范印刷版本的文本为准。大多是改版措辞；如果效果明显不同，需要向用户报告。",
  "",
  ...textVariants.map((v) => `- ${v.variant}（规范 ${v.canonical}）\n  - 规范：${JSON.stringify(v.canonicalText)}\n  - 此版：${JSON.stringify(v.variantText)}`),
  "",
  "## 没有英文文本的定义（日版独有）",
  "",
  "`effect_en` 里是日文。需要用户决定以什么文本为准。",
  "",
  ...noEnglishText.map((id) => `- ${id}（${bySet(id)}）`),
  "",
  "## 英文官方文本对应到别的卡的定义",
  "",
  "英文文本以 `effect_en` 为准（CLAUDE.md），这里只是记录抓取到的 `effect_en_official` 对不上（按编号匹配的问题，见 docs/data-notes.md）。PR 卡不比较。",
  "",
  ...officialMismatches.map((id) => `- ${id}（${bySet(id)}）`),
  "",
  "## 别名印刷（CR 2.13）",
  "",
  ...cards.flatMap((c) => Object.entries(c.alternateNames ?? {}).map(([p, n]) => `- ${p}「${n.en}」是 ${c.id} ${c.name} 的别名印刷`)),
  "",
  "## 双面卡（CR 2.14）",
  "",
  "背面的日文种族和日文文本由 `data/fixes.ts` 按实卡背面补录（抓取数据里没有）。",
  "",
  ...cards.filter((c) => c.backFace).map((c) => `- ${c.id} ${c.name}；背面 ${c.backFace} ${cards.find((d) => d.id === c.backFace)!.name}`),
  "",
  "## 日文文本与规范印刷不同的印刷版本",
  "",
  "同一张卡的各个印刷版本，日文文本应该相同。不同时需要确认是勘误、数据错误，还是其实是两张不同的卡。",
  "",
  ...japaneseVariants.map((v) => `- ${v.variant}（规范 ${v.canonical}）`),
  "",
  "## 未解析的印刷版本（未支持的卡包）",
  "",
  ...[...reasons].map(([reason, list]) => `- ${reason}：${list.length} 个（${list.slice(0, 8).join("、")}${list.length > 8 ? "……" : ""}）`),
  "",
  "## 其他警告",
  "",
  ...(warnings.length ? warnings.map((w) => `- ${w}`) : ["（无）"]),
  "",
];
writeFileSync(join(repoRoot, "docs", "card-data-report.md"), report.join("\n"), "utf8");
console.log(
  `${textVariants.length} English variants, ${noEnglishText.length} without English, ${officialMismatches.length} official mismatches, ${japaneseVariants.length} Japanese variants, ` +
    `${skipped.length} unparsed printings of unsupported sets, ${warnings.length} warnings -> docs/card-data-report.md`,
);
