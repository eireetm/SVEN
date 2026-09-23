/**
 * Generate docs/card-status.md: implementation and test status of every BP01 card.
 *
 *   npm run cards:status
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createEngine } from "../packages/core/src";
import { BP01_CARDS, BP01_SCRIPTS } from "../packages/core/src/sets/bp01";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const engine = createEngine({ cards: BP01_CARDS, scripts: BP01_SCRIPTS });

/**
 * Cards with a dedicated card test: a file named after the card, or a test title that starts
 * with the card's number (titles look like "006 Robin Hood — ..." or "018 / 019 Archer — ...").
 */
function testedCards(set: string): Set<string> {
  const dir = join(repoRoot, "packages", "core", "test", "cards", set);
  const ids = new Set<string>();
  for (const file of readdirSync(dir)) {
    if (file.startsWith(`${set}-`)) ids.add(file.replace(/\.test\.ts$/, ""));
    for (const [, title] of readFileSync(join(dir, file), "utf8").matchAll(/\bit\("([^"]*)"/g)) {
      const head = title!.split(" — ")[0]!;
      for (const [, num] of head.matchAll(/(?:^|\/\s*)((?:T|LD)?\d{2,3})\b/g)) ids.add(`${set}-${num}`);
    }
  }
  return ids;
}

const tested = testedCards("BP01");
const rows = BP01_CARDS.map((c) => {
  const status = engine.implementationStatus(c.id);
  const hasTest = tested.has(c.id);
  const kind = [c.type, c.evolved ? "evolved" : "", c.token ? "token" : ""].filter(Boolean).join(" ");
  return { c, status, tested: hasTest, kind };
});

const count = (s: string) => rows.filter((r) => r.status === s).length;
const label: Record<string, string> = { vanilla: "无需脚本", scripted: "已实现", missing: "未实现" };
const lines = [
  "# BP01 卡牌实现状态",
  "",
  "由 `npm run cards:status` 生成，勿手改。",
  "",
  `- 定义总数：${rows.length}（${BP01_CARDS.reduce((n, c) => n + c.printings.length, 0)} 个印刷版本）`,
  `- 无需脚本（无卡面文本）：${count("vanilla")}`,
  `- 已实现：${count("scripted")}（其中有专门的卡牌用例：${rows.filter((r) => r.status === "scripted" && r.tested).length}；其余由同组用例和整弹冒烟测试覆盖）`,
  `- 未实现：${count("missing")}`,
  "",
  "| 卡号 | 名称 | 中文名 | 类型 | 职业 | 状态 | 测试 | 其他印刷 |",
  "|---|---|---|---|---|---|---|---|",
  ...rows.map(
    ({ c, status, tested, kind }) =>
      `| ${c.id} | ${c.name} | ${c.names.cn ?? ""} | ${kind} | ${c.class} | ${label[status]} | ${tested ? "✓" : ""} | ${c.printings.slice(1).join(" ")} |`,
  ),
];
writeFileSync(join(repoRoot, "docs", "card-status.md"), lines.join("\n") + "\n", "utf8");
console.log(`BP01: ${count("scripted")} scripted, ${count("vanilla")} vanilla, ${count("missing")} missing -> docs/card-status.md`);
