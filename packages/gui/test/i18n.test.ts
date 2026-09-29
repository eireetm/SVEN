import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createEngine, type Decision, type DeckList } from "@sve/core";
import { ALL_CARDS, ALL_SCRIPTS } from "@sve/core/sets";
import { describe, expect, it } from "vitest";
import { Catalog, cardName } from "../src/app/catalog";
import type { UiLang } from "../src/app/settings";
import { deckProblemText, problemKind } from "../src/decks/problems";
import { optionText, scriptLabel } from "../src/game/options";
import { translate, type Translate } from "../src/i18n";
import { COUNTER_NAMES } from "../src/i18n/counters";
import { en, type MessageKey } from "../src/i18n/en";
import { ja } from "../src/i18n/ja";
import { OPTION_TEXT } from "../src/i18n/option-text";
import { zh } from "../src/i18n/zh";

// The interface in English, Chinese and Japanese: every message in each language, and what the engine words in English
// (the options of choices, counters, deck problems) said again in the person's language.

const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });
const catalog = new Catalog(engine.db.all().map((def) => ({ ...def, status: engine.implementationStatus(def.id) })));
const tr = (lang: UiLang): Translate => (key, params) => translate(lang, key, params);

/** Every script file of the Core (card scripts and their shared helpers). */
function scriptFiles(dir = join(__dirname, "..", "..", "core", "src", "script")): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return scriptFiles(path);
    return name.endsWith(".ts") && name !== "types.ts" && name !== "index.ts" ? [path] : [];
  });
}
const sources = scriptFiles().map((path) => ({ path, text: readFileSync(path, "utf8") }));

/** The option labels the scripts write: literals as they are, templates with their ${...} as {0}, {1} ... */
function scriptLabels(): { labels: Set<string>; templates: Map<string, string> } {
  const labels = new Set<string>();
  const templates = new Map<string, string>();
  const re = /label:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g;
  for (const { path, text } of sources) {
    for (const [, raw] of text.matchAll(re)) {
      if (raw!.startsWith('"')) labels.add(JSON.parse(raw!) as string);
      else if (raw!.startsWith("'")) labels.add(raw!.slice(1, -1).replace(/\\'/g, "'"));
      else {
        let i = 0;
        templates.set(
          raw!.slice(1, -1).replace(/\$\{[^}]*\}/g, () => `{${i++}}`),
          path,
        );
      }
    }
  }
  return { labels, templates };
}

/** SD01-001 builds its labels from `${verb} ${i}`: they are listed by verb. */
const EXPANDED: Record<string, readonly string[]> = { "{0} {1}": ["Put onto your field: {0}", "Put into your EX area: {0}"] };
/** Parts of names put into a pattern (BP21-026 'A follower with "Amelia" in its name ...'). */
const NAME_PARTS = ["Amelia", "Lecia"];

describe("interface messages", () => {
  it("say every message in Chinese and Japanese, with the same {parameters} as the English", () => {
    const params = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");
    for (const [lang, messages] of [["zh", zh], ["ja", ja]] as const) {
      const wrong = (Object.keys(en) as MessageKey[]).filter((key) => !messages[key] || params(messages[key]) !== params(en[key]));
      expect(wrong, lang).toEqual([]);
    }
  });
});

describe("options of choices", () => {
  const { labels, templates } = scriptLabels();

  it("have Chinese and Japanese texts for every label of the card scripts (a new card's go into i18n/option-text.ts)", () => {
    const missing = [...labels].filter((label) => !OPTION_TEXT[label] && !catalog.named(label) && !/^\d+$/.test(label));
    const missingPatterns = [...templates.keys()].flatMap((key) => EXPANDED[key] ?? [key]).filter((key) => !OPTION_TEXT[key]);
    expect(missing).toEqual([]);
    expect(missingPatterns).toEqual([]);
  });

  it("list no label the scripts don't have any more", () => {
    const known = new Set([...labels, ...[...templates.keys()].flatMap((key) => EXPANDED[key] ?? [key]), ...NAME_PARTS]);
    expect(Object.keys(OPTION_TEXT).filter((key) => !known.has(key))).toEqual([]);
  });

  it("keep each pattern's placeholders, end without 。 and leave no English behind", () => {
    const placeholders = (text: string) => [...text.matchAll(/\{\d+\}/g)].map((m) => m[0]).sort().join(",");
    const wrong = Object.entries(OPTION_TEXT).flatMap(([key, text]) =>
      (["cn", "ja"] as const)
        .filter((lang) => placeholders(text[lang]) !== placeholders(key) || text[lang].endsWith("。") || /\b[a-z]{4,}\b/.test(text[lang]))
        .map((lang) => `${lang}: ${key} -> ${text[lang]}`),
    );
    expect(wrong).toEqual([]);
    expect(Object.values(OPTION_TEXT).filter((text) => !catalog.def(text.card))).toEqual([]);
  });

  const choose = (reason: Extract<Decision, { type: "choose" }>["reason"], ...labels: [string, string][]): Extract<Decision, { type: "choose" }> => ({
    type: "choose",
    player: 0,
    reason,
    options: labels.map(([id, label]) => ({ id, label })),
    min: 1,
    max: 1,
    source: null,
  });
  const say = (d: Extract<Decision, { type: "choose" }>, lang: "en" | "cn" | "ja", ui: UiLang = lang === "cn" ? "zh" : lang) =>
    d.options.map((o) => optionText(o, d, { catalog, lang, t: tr(ui) }));

  it("quote the official card texts, and name cards in the card text's language", () => {
    const golem = catalog.named("Guardform Golem")!;
    expect(say(choose("mode", ["1", "Give this follower Storm"]), "cn")).toEqual(["使这张卡获得【疾驰】能力"]);
    expect(say(choose("mode", ["1", "Give this follower Storm"]), "ja")).toEqual(["これは【疾走】を持つ"]);
    expect(say(choose("token", ["0", "Guardform Golem"]), "cn")).toEqual([cardName(golem, "cn")]);
    expect(say(choose("effect", ["field", "Put a Guardform Golem onto your field"]), "cn")).toEqual([`将1张『${cardName(golem, "cn")}』卡置于场上`]);
    expect(say(choose("effect", ["field", "Put a Guardform Golem onto your field"]), "ja")).toEqual([`『${cardName(golem, "ja")}』1枚を場に置く`]);
    expect(say(choose("effect", ["3", "X = 3"]), "cn")).toEqual(["X = 3"]);
    expect(say(choose("effect", ["3", "Put onto your field: 3"]), "cn")).toEqual(["将3张召唤到场上"]);
    expect(say(choose("mode", ["amelia", 'A follower with "Amelia" in its name from your deck onto the field']), "cn")[0]).toContain("『艾蜜莉亚』");
    expect(say(choose("mode", ["1", "Give this follower Storm"]), "en")).toEqual(["Give this follower Storm"]);
    expect(say(choose("effect", ["1", "{[cost03]}: with 10 Academic cards in your cemetery, deal 8 damage and draw 2 cards"]), "en")[0]).toMatch(/^\(3\): /);
    expect(scriptLabel("A label no script has", { catalog, lang: "cn" })).toBe("A label no script has");
  });

  it("word the engine's own options in the interface language", () => {
    expect(say(choose("playOption", ["normal", "Play normally"], ["banish10", "Banish 10 spells in your cemetery: costs 7"]), "cn")).toEqual([
      "正常使用",
      "将10张墓场中的法术卡消失：将消费变为7",
    ]);
    expect(say(choose("dieReroll", ["keep", "Keep 4"], ["reroll", "Reroll 4"]), "ja")).toEqual(["4のままにする", "振り直す（今の目は4）"]);
    expect(say(choose("damageOrder", ["0", "Take 2 damage (uses up a prevention)"], ["1", "Take no damage"]), "cn")).toEqual([
      "受到 2 点伤害（用掉一次防止伤害的效果）",
      "不受到伤害",
    ]);
    const ub = catalog.def("CP04-001")!;
    expect(say(choose("unionBurst", ["0", "CP04-001 ability 2 (fanfare)"], ["1", "CP04-001 ability 3 (activated)"]), "cn")).toEqual([
      `${cardName(ub, "cn")}：第 2 个能力（入场曲）`,
      `${cardName(ub, "cn")}：第 3 个能力（启动）`,
    ]);
    expect(say(choose("effect", ["Goblin", "Goblin"], ["(other name)", "Another card name"]), "ja")).toEqual([cardName(catalog.named("Goblin"), "ja"), "その他のカード名"]);
  });
});

describe("counters", () => {
  it("have a name in each language for every counter kind of the card scripts (a new one goes into i18n/counters.ts)", () => {
    const consts = new Map<string, string>();
    for (const { text } of sources) for (const [, name, value] of text.matchAll(/const ([A-Z_][A-Z0-9_]*) = "([^"]+)"/g)) consts.set(name!, value!);
    const kinds = new Set<string>();
    const re = /(?:addCounters|removeCounters|counters|counterCount|hasCounters?)\s*\(\s*[^,()]*(?:\([^()]*\))?[^,()]*,\s*(?:"([a-z][a-zA-Z ]*)"|([A-Z_][A-Z0-9_]*))/g;
    for (const { text } of sources) for (const m of text.matchAll(re)) kinds.add(m[1] ?? consts.get(m[2]!) ?? m[2]!);
    expect(kinds.size).toBeGreaterThan(15);
    const missing = [...kinds].filter((kind) => !(["en", "zh", "ja"] as const).every((lang) => COUNTER_NAMES[kind]?.[lang]));
    expect(missing).toEqual([]);
  });
});

describe("deck problems", () => {
  const cards = engine.db.all();
  const printing = (id: string) => catalog.def(id)!.printings[0]!;
  const playable = (d: (typeof cards)[number]) => d.type !== "leader" && !d.token && !d.evolved && !d.advanced && !d.universe;
  const forest = cards.find((d) => playable(d) && d.class === "Forestcraft" && d.type === "follower")!;
  const rune = cards.find((d) => playable(d) && d.class === "Runecraft" && d.type === "follower")!;
  const evolved = cards.find((d) => d.evolved && !d.token && !d.universe)!;
  const leader = cards.find((d) => d.type === "leader" && d.class === "Forestcraft" && !d.universe)!;
  const vgLeader = cards.find((d) => d.type === "leader" && d.universe === "vanguard")!;
  const vanguard = cards.filter((d) => d.universe === "vanguard" && !d.token && !d.evolved && d.type !== "leader");
  const amulets = vanguard.filter((d) => ALL_SCRIPTS[d.id]?.keywords?.includes("startingAmulet"));
  const trigger = vanguard.find((d) => d.trigger !== undefined && d.class !== vgLeader.class && d.class !== "Neutral")!;
  const copies = (d: { id: string }, n: number) => Array<string>(n).fill(printing(d.id));
  const decks: DeckList[] = [
    { leader: printing(leader.id), main: ["XX-000", ...copies(evolved, 1), ...copies(forest, 4), ...copies(rune, 1)], evolve: copies(forest, 1) },
    { leader: printing(forest.id), main: [], evolve: copies(evolved, 11) },
    { main: copies(forest, 40), evolve: [] },
    { leader: printing(vgLeader.id), main: [...copies(trigger, 1)], evolve: [] },
    { leader: printing(vgLeader.id), main: [...copies(amulets[0]!, 1), ...copies(amulets.find((d) => d.name !== amulets[0]!.name)!, 1)], evolve: [] },
  ];
  const problems = decks.flatMap((deck) => engine.validateDeck(deck, { deckRestrictions: true }));

  it("are all known kinds, and every kind the engine reports is met here", () => {
    expect(problems.filter((p) => problemKind(p) === null)).toEqual([]);
    // No card of the pool is unimplemented now: that one kind is checked with the engine's wording (deck.ts).
    const kinds = new Set([...problems, "card effect not implemented yet: BP01-001 Goblin"].map(problemKind));
    const all = (Object.keys(en) as MessageKey[]).filter((k) => /^deckProblem\.[a-zA-Z]+$/.test(k) && k !== "deckProblem.card");
    expect(all.filter((k) => !kinds.has(k))).toEqual([]);
  });

  it("are said again in the interface language, with the cards' names in the card text's language", () => {
    const copiesOf = problems.find((p) => problemKind(p) === "deckProblem.copies" && p.includes(forest.name))!;
    expect(deckProblemText(copiesOf, { catalog, lang: "cn", t: tr("zh") })).toBe(`主牌组：${cardName(catalog.def(forest.id), "cn")} 有 4 张，至多 3 张（CR 6.1.1.4）`);
    const wrongClass = problems.find((p) => problemKind(p) === "deckProblem.wrongClass")!;
    expect(deckProblemText(wrongClass, { catalog, lang: "ja", t: tr("ja") })).toContain("（ウィッチ）はリーダーのクラス（エルフ）と合いません");
    expect(deckProblemText("something new", { catalog, lang: "cn", t: tr("zh") })).toBe("something new");
  });
});
