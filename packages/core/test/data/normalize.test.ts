import { describe, expect, it } from "vitest";
import { CardDataError, groupPrintings, normalizePrinting, type RawCardJson } from "../../src";
import { parseCardType, parseTraits } from "../../src/data/normalize";

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

  it("rejects impossible stats instead of guessing", () => {
    expect(() => normalizePrinting(raw({ atk: null }))).toThrow(CardDataError);
    expect(() => normalizePrinting(raw({ card_type: ["Leader"] }))).toThrow(CardDataError);
    expect(() => normalizePrinting(raw({ card_type: ["Spell"], cost: null, atk: null, def: null }))).toThrow(CardDataError);
  });

  it("CR 2.4 — takes traits from the Japanese data only", () => {
    expect(normalizePrinting(raw({ traits: ["Pixie", "Beast"], traits_ja: "妖精・獣" })).def.traits).toEqual(["妖精", "獣"]);
    expect(normalizePrinting(raw({ traits: ["Something else"] })).def.traits).toEqual(["兵士"]); // English is ignored
    expect(normalizePrinting(raw({ traits_ja: "-" })).def.traits).toEqual([]);
    // A "・" inside 〈〉 belongs to the trait name.
    expect(parseTraits("x", "プリコネ・〈ジオ・ゲヘナ〉")).toEqual(["プリコネ", "〈ジオ・ゲヘナ〉"]);
    expect(() => parseTraits("x", null)).toThrow(/missing Japanese traits/);
    expect(() => parseTraits("x", "自然\u00b7指挥官")).toThrow(CardDataError); // Chinese data
    expect(() => parseTraits("x", "妖精・")).toThrow(CardDataError);
  });

  it("prefers the official English text", () => {
    const p = normalizePrinting(raw({ effect_en: "fan text", effect_en_official: "official text" }));
    expect(p.def.text.en).toBe("official text");
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

  it("keeps a base card and its evolved card apart even though they share a name", () => {
    const base = normalizePrinting(raw({ card_no: "XX01-001" }));
    const evo = normalizePrinting(raw({ card_no: "XX01-002", name_en: "Test (Evolved)", card_type: ["Follower", "Evolved"], cost: null }));
    expect(groupPrintings([base, evo], ["XX01"]).cards).toHaveLength(2);
  });

  it("refuses same-name printings with different game information", () => {
    const a = normalizePrinting(raw({ card_no: "XX01-001" }));
    const b = normalizePrinting(raw({ card_no: "XX01-P01", atk: 3 }));
    expect(() => groupPrintings([a, b], ["XX01"])).toThrow(CardDataError);
  });

  it("reports (but tolerates) wording differences between printings", () => {
    const a = normalizePrinting(raw({ card_no: "XX01-001", effect_en_official: "Draw a card." }));
    const b = normalizePrinting(raw({ card_no: "XX01-P01", effect_en_official: "Draw 1 card." }));
    const { cards, textVariants } = groupPrintings([b, a], ["XX01"]);
    expect(cards[0]!.text.en).toBe("Draw a card.");
    expect(textVariants).toEqual([
      { canonical: "XX01-001", variant: "XX01-P01", canonicalText: "Draw a card.", variantText: "Draw 1 card." },
    ]);
  });
});
