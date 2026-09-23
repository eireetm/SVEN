import type { RawCardJson } from "./raw";

/**
 * Corrections of the scraped card data, applied by the build tool before normalization.
 *
 * Every entry must cite its evidence: the card's other language fields, other printings of the
 * same card, or a decision of the project owner. Anything else is reported, not fixed.
 * See docs/data-notes.md ("全卡包扫描").
 */
export const DATA_FIXES: Readonly<Record<string, Partial<RawCardJson>>> = {
  // English names and texts swapped within ETD02: the Japanese names, texts and costs are
  // ソウルコンバージョン (= BP01-116 "Soul Conversion", cost 1) and 消えぬ怨恨 (= SD05-015
  // "Undying Resentment", cost 2). Their English texts are dropped; the other printings have them.
  "ETD02-007": { name_en: "Soul Conversion", effect_en: null, effect_en_official: null },
  "ETD02-016": { name_en: "Undying Resentment", effect_en: null, effect_en_official: null },
  // An evolved card without the " (Evolved)" suffix; its Japanese name, type and stats are those
  // of BP07-070 "Mono, Garnet Rebel (Evolved)".
  "BP21-PR01": { name_en: "Mono, Garnet Rebel (Evolved)" },
  // "Akiha Ikebukuro (Evolved)" listed as a plain follower (no cost, "(Evolved)" in its name,
  // On Evolve text).
  "CSD02a-008": { card_type: ["Follower", "Evolved"] },
  "CSD02a-P05": { card_type: ["Follower", "Evolved"] },
  // Chinese traits (自然·指挥官·野兽) in the Japanese field; the alternate printing BP07-SL04
  // has the Japanese traits.
  "BP07-018": { traits_ja: "自然・指揮官・獣" },
};

/** Apply the fix table to one raw card file. */
export function applyDataFixes(raw: RawCardJson): RawCardJson {
  const fix = DATA_FIXES[raw.card_no];
  return fix ? { ...raw, ...fix } : raw;
}
