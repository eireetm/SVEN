import { describe, expect, it } from "vitest";
import { CardDataError, groupPrintings, normalizePrinting, type RawCardJson } from "../../src";
import { parseCardType, parseTraits } from "../../src/data/normalize";
import { englishText, japaneseKey, sameCardText, treatedAs } from "../../src/data/english-text";
import { applyDataFixes } from "../../src/data/fixes";

function raw(over: Partial<RawCardJson>): RawCardJson {
  return {
    card_no: "XX01-001",
    name_en: "Test",
    name_ja: "テスト",
    name_cn: "测试",
    set: "XX01",
    rarity: "B",
    class: "Neutral",
    card_type: ["Follower"],
    traits: ["Soldier"],
    traits_ja: "兵士",
    cost: 2,
    atk: 2,
    def: 2,
    effect_en: "",
    effect_en_official: "",
    effect_ja: "",
    effect_ja_sve: "",
    effect_cn: "",
    flavor_text_ja: null,
    flavor_text_en: null,
    illustrator: null,
    rulings: null,
    image: "XX01-001.webp",
    ...over,
  };
}

describe("normalizePrinting", () => {
  it("CR 2.3 — parses primary and special card types", () => {
    expect(parseCardType("x", ["Follower", "Evolved"])).toEqual({ type: "follower", evolved: true, token: false });
    expect(parseCardType("x", ["Spell", "Token"])).toEqual({ type: "spell", evolved: false, token: true });
    expect(() => parseCardType("x", ["Follower", "Advance"])).toThrow(CardDataError);
    expect(() => parseCardType("x", ["Follower", "Spell"])).toThrow(CardDataError);
    expect(() => parseCardType("x", ["Token"])).toThrow(CardDataError);
  });

  it("strips the database's (Evolved) suffix and requires it on evolved cards", () => {
    const p = normalizePrinting(raw({ name_en: "Test (Evolved)", card_type: ["Follower", "Evolved"], cost: null }));
    expect(p.def.name).toBe("Test");
    expect(() => normalizePrinting(raw({ card_type: ["Follower", "Evolved"], cost: null }))).toThrow(/suffix/);
  });

  it("CR 5.16.1.2.1 — accepts evolved amulets (BP08-090) without cost or stats, but no other evolved non-followers", () => {
    const amulet = normalizePrinting(raw({ name_en: "Test (Evolved)", card_type: ["Amulet", "Evolved"], cost: null, atk: null, def: null }));
    expect([amulet.def.type, amulet.def.evolved, amulet.def.cost, amulet.def.attack]).toEqual(["amulet", true, null, null]);
    expect(() => normalizePrinting(raw({ name_en: "Test (Evolved)", card_type: ["Amulet", "Evolved"], cost: 2, atk: null, def: null }))).toThrow(CardDataError);
    expect(() => parseCardType("x", ["Spell", "Evolved"])).toThrow(CardDataError);
  });

  it("rejects impossible stats instead of guessing", () => {
    expect(() => normalizePrinting(raw({ atk: null }))).toThrow(CardDataError);
    expect(() => normalizePrinting(raw({ card_type: ["Leader"] }))).toThrow(CardDataError);
    expect(() => normalizePrinting(raw({ card_type: ["Spell"], cost: null, atk: null, def: null }))).toThrow(CardDataError);
  });

  it("CR 2.4 — takes traits from the Japanese data only", () => {
    expect(normalizePrinting(raw({ traits: ["Pixie", "Beast"], traits_ja: "妖精・獣" })).traits).toEqual(["妖精", "獣"]);
    expect(normalizePrinting(raw({ traits: ["Something else"] })).traits).toEqual(["兵士"]); // English is ignored
    expect(normalizePrinting(raw({ traits_ja: "-" })).traits).toEqual([]);
    expect(normalizePrinting(raw({ traits_ja: null })).traits).toBeNull(); // taken from another printing
    // A "・" inside 〈〉 belongs to the trait name.
    expect(parseTraits("x", "プリコネ・〈ジオ・ゲヘナ〉")).toEqual(["プリコネ", "〈ジオ・ゲヘナ〉"]);
    expect(() => parseTraits("x", "自然\u00b7指挥官")).toThrow(CardDataError); // Chinese data
    expect(() => parseTraits("x", "妖精・")).toThrow(CardDataError);
  });
});

describe("English text", () => {
  const en = (over: Partial<RawCardJson>) => englishText(raw(over));

  it("takes the English text from effect_en (CLAUDE.md), comparing the official text only for the report", () => {
    const fan = "Ward.\nThis follower takes 1 less damage.";
    expect(en({ effect_en: fan, effect_en_official: "Ward.\nReduce damage dealt to this follower by 1." }))
      .toEqual({ text: fan, source: "effect_en", officialMismatch: false });
  });

  it("detects an official text that belongs to another card (matched by the wrong number)", () => {
    // BP02-110 Archangel Reina: the official field holds another card's Strike ability.
    const fan = "{[evolve]} {[cost01]}: Evolve this follower.\nWard.";
    const official = "{[evolve]}{[cost01]}: Evolve this follower.\nStrike: Give your leader {[defense]}+2.";
    expect(sameCardText(official, fan)).toBe(false);
    expect(en({ effect_en: fan, effect_en_official: official })).toEqual({ text: fan, source: "effect_en", officialMismatch: true });
    // PR official texts are known to be wrong and are not even compared.
    expect(en({ set: "PR", effect_en: fan, effect_en_official: official }).officialMismatch).toBe(false);
  });

  it("treats Japanese in effect_en as no English text (Japan-only printings)", () => {
    expect(en({ effect_en: "カードを1枚引く。", effect_en_official: "Ward." })).toEqual({ text: "", source: "none", officialMismatch: false });
  });

  it("CR 2.13 — an alternate-name printing joins the card it is treated as", () => {
    expect(treatedAs("(This card is treated as Vania, Vampire Princess.)\n{[fanfare]} ...")).toBe("Vania, Vampire Princess");
    const p = normalizePrinting(raw({ card_no: "XX01-002", name_en: "La+", effect_en: "(This card is treated as Test.)\nDraw a card." }));
    expect([p.def.name, p.def.text.en, p.alternateName?.en]).toEqual(["Test", "Draw a card.", "La+"]);
  });

  it("compares Japanese texts without reminder text", () => {
    const k = (effect_ja: string) => japaneseKey(raw({ effect_ja }));
    expect(k("【守護】（説明）\n\nカードを1枚引く。")).toBe(k("【守護】カードを1枚引く。"));
    expect(k("カードを1枚引く。\n―――\n『トークン』")).toBe(k("カードを1枚引く。"));
  });

  it("applies the documented data fixes", () => {
    expect(applyDataFixes(raw({ card_no: "ETD02-007", name_en: "Undying Resentment" })).name_en).toBe("Soul Conversion");
    expect(applyDataFixes(raw({ card_no: "XX01-001" })).name_en).toBe("Test");
  });
});

describe("groupPrintings", () => {
  it("CR 2.1.1 — merges same-name printings, canonical = regular collector number", () => {
    const a = normalizePrinting(raw({ card_no: "XX01-P01" }));
    const b = normalizePrinting(raw({ card_no: "XX01-001" }));
    const { cards } = groupPrintings([a, b], ["XX01"]);
    expect(cards).toHaveLength(1);
    expect(cards[0]!.id).toBe("XX01-001");
    expect(cards[0]!.printings).toEqual(["XX01-001", "XX01-P01"]);
  });

  it("attaches printings of other sets, and skips cards without a printing in a supported set", () => {
    const a = normalizePrinting(raw({ card_no: "XX01-001" }));
    const promo = normalizePrinting(raw({ card_no: "PR-001", set: "PR", traits_ja: null }));
    const other = normalizePrinting(raw({ card_no: "YY01-001", set: "YY01", name_en: "Other" }));
    const { cards, setOf } = groupPrintings([promo, other, a], ["XX01"]);
    expect(cards.map((c) => [c.id, c.printings, c.traits])).toEqual([["XX01-001", ["XX01-001", "PR-001"], ["兵士"]]]);
    expect(setOf).toEqual({ "XX01-001": "XX01" });
  });

  it("gives the earlier supported set the canonical printing, and prefers the card's own name to alternate names", () => {
    const later = normalizePrinting(raw({ card_no: "XX02-001", set: "XX02" }));
    const earlier = normalizePrinting(raw({ card_no: "XX01-050" }));
    const alias = normalizePrinting(raw({ card_no: "XX01-001", name_en: "La+", effect_en: "(This card is treated as Test.)" }));
    const [card] = groupPrintings([later, alias, earlier], ["XX01", "XX02"]).cards;
    expect([card!.id, card!.printings, card!.alternateNames]).toEqual([
      "XX01-050",
      ["XX01-050", "XX01-001", "XX02-001"],
      { "XX01-001": { en: "La+", cn: "测试", ja: "テスト" } },
    ]);
  });

  it("keeps a base card and its evolved card apart even though they share a name", () => {
    const base = normalizePrinting(raw({ card_no: "XX01-001" }));
    const evo = normalizePrinting(raw({ card_no: "XX01-002", name_en: "Test (Evolved)", card_type: ["Follower", "Evolved"], cost: null }));
    expect(groupPrintings([base, evo], ["XX01"]).cards).toHaveLength(2);
  });

  it("refuses same-name printings with different game information or traits, and cards without traits", () => {
    const a = normalizePrinting(raw({ card_no: "XX01-001" }));
    expect(() => groupPrintings([a, normalizePrinting(raw({ card_no: "XX01-P01", atk: 3 }))], ["XX01"])).toThrow(CardDataError);
    expect(() => groupPrintings([a, normalizePrinting(raw({ card_no: "XX01-P01", traits_ja: "妖精" }))], ["XX01"])).toThrow(/traits/);
    expect(() => groupPrintings([normalizePrinting(raw({ traits_ja: null }))], ["XX01"])).toThrow(/no printing/);
  });

  it("reports (but tolerates) text differences between printings", () => {
    const a = normalizePrinting(raw({ card_no: "XX01-001", effect_en: "Draw a card.", effect_ja: "1枚引く。" }));
    const reworded = normalizePrinting(raw({ card_no: "XX01-P01", effect_en: "Draw a card. (Reminder text.)", effect_ja: "1枚引く。" }));
    const other = normalizePrinting(raw({ card_no: "XX01-P02", effect_en: "Deal 3 damage to an enemy follower.", effect_ja: "3ダメージ。" }));
    const { cards, textVariants, japaneseVariants } = groupPrintings([other, reworded, a], ["XX01"]);
    expect(cards[0]!.text.en).toBe("Draw a card.");
    expect(textVariants.map((v) => v.variant)).toEqual(["XX01-P02"]);
    expect(japaneseVariants).toEqual([{ canonical: "XX01-001", variant: "XX01-P02" }]);
  });
});
