import type { AbilityDef } from "@sve/core";
import { ALL_CARDS, ALL_SCRIPTS } from "@sve/core/sets";
import { describe, expect, it } from "vitest";
import type { CardLang } from "../src/app/settings";
import { rankOf } from "../src/engine/game-host";
import { abilityLine, markedLines, OTHER_LINES } from "../src/game/card/ability-text";

// A choice between pending automatic abilities shows each one's own line of the card text: two Fanfares of one card (CP04-037
// Karyl's) read the same by their timing alone. Checked against every card: each ability of a timing with a mark gets its own
// line in every card language, and the cards with more than one trigger without a mark are all in OTHER_LINES.

const LANGS: readonly CardLang[] = ["en", "cn", "ja"];
const MARKED = ["fanfare", "lastWords", "onEvolve", "onSuperEvolve", "strike", "onRace", "onDrive"];
type Automatic = Extract<AbilityDef, { kind: "automatic" }>;

/** The card's text in a language, or null where the data has none (a pre-release card's English text is a placeholder). */
const textOf = (card: (typeof ALL_CARDS)[number], lang: CardLang): string | null => {
  const text = card.text[lang];
  return text && text !== "unavailable" ? text : null;
};

/** Each card's automatic abilities by timing, with their indexes in its script. */
function byTiming(abilities: readonly AbilityDef[]): Map<string, number[]> {
  const out = new Map<string, number[]>();
  abilities.forEach((a, i) => {
    if (a.kind === "automatic") out.set(a.timing, [...(out.get(a.timing) ?? []), i]);
  });
  return out;
}

describe("an ability's line of its card text", () => {
  it("tells CP04-037 Karyl's two Fanfares apart, in every card language", () => {
    const abilities = ALL_SCRIPTS["CP04-037"]!.abilities ?? [];
    expect([rankOf(abilities, 0), rankOf(abilities, 1), rankOf(abilities, 2)]).toEqual([{ rank: 0, count: 2 }, {}, { rank: 1, count: 2 }]);
    const karyl = ALL_CARDS.find((c) => c.id === "CP04-037")!;
    const line = (lang: CardLang, rank: number) => abilityLine("CP04-037", karyl.text[lang] ?? "", lang, "fanfare", rank, 2);
    expect(line("cn", 0)).toBe("《UB》《入场曲》将手牌中的1张法术卡舍弃：选择敌方场上的1个从者。给予其3点伤害。抽取1张卡。");
    expect(line("cn", 1)).toBe("《入场曲》《消费2》：将1张『混沌魔法书』卡装备到这张卡。");
    expect(line("ja", 0)).toMatch(/^UBファンファーレ手札のスペル1枚を捨てる：/);
    expect(line("ja", 1)).toBe("ファンファーレコスト2：これは『ケイオスグリモワール』1枚を装備する。");
    expect(line("en", 1)).toBe("{[fanfare]} {[cost02]} Equip this with a Chaos Grimoire token.");
  });

  it("gives each of a card's abilities with one marked timing its own line, in every language its text is in", () => {
    const problems: string[] = [];
    for (const card of ALL_CARDS) {
      const abilities = ALL_SCRIPTS[card.id]?.abilities ?? [];
      for (const [timing, indexes] of byTiming(abilities)) {
        if (!MARKED.includes(timing) || indexes.length < 2) continue;
        for (const lang of LANGS) {
          const text = textOf(card, lang);
          if (!text) continue;
          const lines = indexes.map((_, rank) => abilityLine(card.id, text, lang, timing, rank, indexes.length));
          if (lines.some((l) => l === null) || new Set(lines).size !== lines.length) problems.push(`${card.id} ${timing} ${lang}`);
          // A Union Burst ability is the line with the UB icon (the order the script lists them in is the text's).
          indexes.forEach((index, rank) => {
            const ub = (abilities[index] as Automatic).unionBurst === true;
            if (ub !== /^(?:\{\[ub\]\}|《UB》|UB)/.test(lines[rank] ?? "")) problems.push(`${card.id} ${timing} ${lang}: UB of ${rank}`);
          });
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it("lists every card with more than one trigger without a mark in OTHER_LINES, one line of its text for each", () => {
    const problems: string[] = [];
    const cards = new Set<string>();
    for (const card of ALL_CARDS) {
      const abilities = ALL_SCRIPTS[card.id]?.abilities ?? [];
      const others = byTiming(abilities).get("other") ?? [];
      const count = others.length;
      if (count < 2) continue;
      cards.add(card.id);
      for (const lang of LANGS) {
        const text = textOf(card, lang);
        const lines = OTHER_LINES[card.id]?.[lang];
        if (!text) {
          if (lines) problems.push(`${card.id} ${lang}: lines for a text the data doesn't have`);
          continue;
        }
        if (lines?.length !== count) {
          problems.push(`${card.id} ${lang}: ${count} triggers without a mark, ${lines?.length ?? "no"} lines in OTHER_LINES`);
          continue;
        }
        const all = text.split("\n");
        const marked = new Set(MARKED.flatMap((timing) => markedLines(text, lang, timing)));
        lines.forEach((index, rank) => {
          const line = all[index];
          // A delayed trigger is said by the line of the ability that sets it up (BP22-037's Fanfare).
          const delayed = (abilities[others[rank]!] as Automatic).delayed === true;
          if (!line || (marked.has(line) && !delayed) || /^[-―]+$/.test(line.trim())) problems.push(`${card.id} ${lang}: line ${index} isn't a trigger's`);
        });
      }
    }
    expect(Object.keys(OTHER_LINES).filter((id) => !cards.has(id))).toEqual([]);
    expect(problems).toEqual([]);
  });

  it("follows the Japanese and Chinese order where it differs from the English one, and gives no line where the text doesn't tell", () => {
    const text = (id: string, lang: CardLang) => ALL_CARDS.find((c) => c.id === id)!.text[lang] ?? "";
    // BP10-004: the first trigger is "Whenever an enemy follower is put onto the field", the second the end phase one.
    expect(abilityLine("BP10-004", text("BP10-004", "en"), "en", "other", 1, 2)).toBe("At the start of your end phase, refresh this card.");
    expect(abilityLine("BP10-004", text("BP10-004", "cn"), "cn", "other", 1, 2)).toBe("当自己的结束阶段到来时，将这张卡竖置。");
    expect(abilityLine("BP10-004", text("BP10-004", "ja"), "ja", "other", 0, 2)).toMatch(/^相手の場にフォロワーが出たとき/);
    // The Chinese and Japanese texts split BP03-090's one Fanfare in two: no line rather than half of it.
    expect(abilityLine("BP03-090", text("BP03-090", "cn"), "cn", "fanfare", 0, 1)).toBeNull();
    expect(abilityLine("BP03-090", text("BP03-090", "en"), "en", "fanfare", 0, 1)).toMatch(/^\{\[fanfare\]\} If this card was put onto the field from your hand/);
    // One trigger without a mark: its card's name says which.
    expect(abilityLine("BP01-126", text("BP01-126", "cn"), "cn", "other", 0, 1)).toBeNull();
    // Older sets bracket the marks, and one line may have two ("Fanfare/Last Words").
    expect(markedLines(text("BP01-031", "ja"), "ja", "lastWords")).toHaveLength(1);
    expect(markedLines(text("BP18-049", "cn"), "cn", "lastWords")).toEqual(markedLines(text("BP18-049", "cn"), "cn", "fanfare"));
  });
});
