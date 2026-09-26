/**
 * Generate the implementation and test status of every supported set:
 * docs/card-status.md (summary) and docs/card-status/<SET>.md (one row per card definition).
 *
 *   npm run cards:status
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createEngine } from "../packages/core/src";
import { ALL_CARDS, ALL_SCRIPTS, SETS, SUPPORTED_SETS } from "../packages/core/src/sets";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });

/**
 * Cards with a dedicated card test: a file named after the card, or a test title that starts
 * with the card's number (titles look like "006 Robin Hood — ..." or "018 / 019 Archer — ...").
 */
function testedCards(set: string): Set<string> {
  const dir = join(repoRoot, "packages", "core", "test", "cards", set);
  const ids = new Set<string>();
  if (!existsSync(dir)) return ids;
  for (const file of readdirSync(dir)) {
    if (file.startsWith(`${set}-`)) ids.add(file.replace(/\.test\.ts$/, ""));
    for (const [, title] of readFileSync(join(dir, file), "utf8").matchAll(/\bit\("([^"]*)"/g)) {
      const head = title!.split(" — ")[0]!;
      // A back face of a double-faced card is written "005_back" (CR 2.14); tokens "T01", leaders
      // "LD01", and cards numbered in the U series (BP08-U07) "U07".
      for (const [, num] of head.matchAll(/(?:^|\/\s*)((?:T|LD|U)?\d{2,3}(?:_back)?)\b/g)) ids.add(`${set}-${num}`);
    }
  }
  return ids;
}

const label: Record<string, string> = { vanilla: "无需脚本", scripted: "已实现", missing: "未实现" };
const summary: string[] = [];
mkdirSync(join(repoRoot, "docs", "card-status"), { recursive: true });
for (const set of SUPPORTED_SETS) {
  const cards = SETS[set].cards;
  const tested = testedCards(set);
  const rows = cards.map((c) => {
    const status = engine.implementationStatus(c.id);
    const kind = [c.type, c.evolved ? "evolved" : "", c.advanced ? "advanced" : "", c.token ? "token" : "", c.frontFace ? "(back face)" : ""].filter(Boolean).join(" ");
    return { c, status, tested: tested.has(c.id), kind };
  });
  const count = (s: string) => rows.filter((r) => r.status === s).length;
  const printings = cards.reduce((n, c) => n + c.printings.length, 0);
  const scriptedTested = rows.filter((r) => r.status === "scripted" && r.tested).length;
  const lines = [
    `# ${set} 卡牌实现状态`,
    "",
    "由 `npm run cards:status` 生成，勿手改。",
    "",
    `- 定义总数：${rows.length}（${printings} 个印刷版本，含其他卡包里的异画、再录）`,
    `- 无需脚本（无卡面文本）：${count("vanilla")}`,
    `- 已实现：${count("scripted")}（其中有专门的卡牌用例：${scriptedTested}；其余由同组用例和整弹冒烟测试覆盖）`,
    `- 未实现：${count("missing")}`,
    "",
    "| 卡号 | 名称 | 中文名 | 类型 | 职业 | 状态 | 测试 | 其他印刷 |",
    "|---|---|---|---|---|---|---|---|",
    ...rows.map(
      ({ c, status, tested: t, kind }) =>
        `| ${c.id} | ${c.name} | ${c.names.cn ?? ""} | ${kind} | ${c.class} | ${label[status]} | ${t ? "✓" : ""} | ${c.printings.slice(1).join(" ")} |`,
    ),
  ];
  writeFileSync(join(repoRoot, "docs", "card-status", `${set}.md`), lines.join("\n") + "\n", "utf8");
  summary.push(`| [${set}](card-status/${set}.md) | ${rows.length} | ${count("vanilla")} | ${count("scripted")} | ${count("missing")} |`);
  console.log(`${set}: ${count("scripted")} scripted, ${count("vanilla")} vanilla, ${count("missing")} missing -> docs/card-status/${set}.md`);
}
writeFileSync(
  join(repoRoot, "docs", "card-status.md"),
  ["# 卡牌实现状态", "", "由 `npm run cards:status` 生成，勿手改。", "", "| 卡包 | 定义 | 无需脚本 | 已实现 | 未实现 |", "|---|---|---|---|---|", ...summary, ""].join("\n"),
  "utf8",
);
