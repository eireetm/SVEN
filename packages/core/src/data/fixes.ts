import type { RawCardBack, RawCardJson } from "./raw";

/** A correction of one printing; `back` fields are merged into the scraped back face. */
export type DataFix = Partial<Omit<RawCardJson, "back">> & { back?: Partial<RawCardBack> };

/*
 * CR 2.14 — back faces of BP09's double-faced evolved cards. The scraped data has no Japanese
 * traits or Chinese name for a back face and repeats the front's Japanese text, so these are
 * transcribed from the printed back face (assets/<card>/<card>_back.webp, Japanese card; decided
 * by the project owner). They agree with the scraped English traits and text. The Chinese names
 * are the ones the front and base cards' Chinese texts use (e.g. BP09-004 "进化为『真红羁绊·宝菈』").
 * Alternate-art printings carry the same back face.
 */
const BP09_005_BACK: Partial<RawCardBack> = {
  traits_ja: "妖精",
  name_cn: "真红羁绊·宝菈",
  effect_ja:
    "【攻撃時】【コンボ_3】相手の場のフォロワー1体を選ぶ。それに3ダメージ。\n【進化時】自分の場の他のカード2枚まで選ぶ。それをEXエリアに置く。",
};
const BP09_019_BACK: Partial<RawCardBack> = {
  traits_ja: "指揮官・キラー",
  name_cn: "绝望使者·榭莉亚",
  effect_ja:
    "【疾走】\n【進化時】『スティールナイト』1体と『ナイト』1体を出す。\n―――――――――――――――\n" +
    "『スティールナイト』{[swordcraft]}兵士・フォロワー{[cost02]}{[attack]}2/{[defense]}2\n" +
    "『ナイト』{[swordcraft]}兵士・フォロワー{[cost01]}{[attack]}1/{[defense]}1",
};
const BP09_039_BACK: Partial<RawCardBack> = {
  traits_ja: "学院・キラー",
  name_cn: "马纳历亚黑龙",
  effect_ja: "【指定攻撃】\n【進化時】相手のリーダーすべてに3ダメージ。",
};
const BP09_056_BACK: Partial<RawCardBack> = {
  traits_ja: "竜族・キラー",
  name_cn: "邪龙·林德沃姆",
  effect_ja: "【疾走】\nこれは【守護】を無視して攻撃できる。",
};
const BP09_070_BACK: Partial<RawCardBack> = {
  traits_ja: "吸血鬼・プリンセス・キラー",
  name_cn: "血色女王·班比",
  effect_ja:
    "【疾走】\nこれがいる限り、自分が『フォレストバット』をプレイする際、コストを-1する。\n" +
    "自分の場に『フォレストバット』が出たとき、相手の場のフォロワー1体を選ぶ。それに3ダメージ。",
};
const BP09_090_BACK: Partial<RawCardBack> = {
  traits_ja: "信仰・獣・キラー",
  name_cn: "夜幕神鹿·刻律涅",
  effect_ja: "【必殺】\n【進化時】場のアミュレット1つを墓場に置く：相手のリーダー1人か相手の場のフォロワー1体を選ぶ。それに4ダメージ。",
};

// BP08-003 Orchis, Vengeful Puppet. The scraped back repeats the front's Japanese text and lacks
// Japanese traits / Chinese name. Transcribed from assets/BP08-003/BP08-003_back.webp; the same
// printed back is used by BP08-SL03. The Chinese name is used by the front/base Chinese text.
const BP08_003_BACK: Partial<RawCardBack> = {
  traits_ja: "人形・キラー",
  name_cn: "复仇的人偶·奥契丝",
  effect_ja:
    "これがいる限り、自分の場の『操り人形』すべては【指定攻撃】を持つ。\n" +
    "自分の『操り人形』が場を離れたとき、相手のリーダー1人か相手の場のフォロワー1体を選ぶ。それに2ダメージ。\n" +
    "【進化時】『操り人形』4体を出す。",
};

/**
 * Corrections of the scraped card data, applied by the build tool before normalization.
 *
 * Every entry must cite its evidence: the card's other language fields, other printings of the
 * same card, or a decision of the project owner. Anything else is reported, not fixed.
 * See docs/data-notes.md ("全卡包扫描").
 */
export const DATA_FIXES: Readonly<Record<string, DataFix>> = {
  // English names and texts swapped within ETD02: the Japanese names, texts and costs are
  // ソウルコンバージョン (= BP01-116 "Soul Conversion", cost 1) and 消えぬ怨恨 (= SD05-015
  // "Undying Resentment", cost 2). Their English texts are dropped; the other printings have them.
  "ETD02-007": { name_en: "Soul Conversion", effect_en: null, effect_en_official: null },
  "ETD02-016": { name_en: "Undying Resentment", effect_en: null, effect_en_official: null },
  // An evolved card without the " (Evolved)" suffix; its Japanese name, type and stats are those
  // of BP07-070 "Mono, Garnet Rebel (Evolved)".
  "BP21-PR01": { name_en: "Mono, Garnet Rebel (Evolved)" },
  // Evolved followers whose printed English name is intentionally different from the base card
  // (レーヴァテインドラゴン・アタックモード). The "(Evolved)" suffix is only the data convention
  // stripEvolvedSuffix removes; the card name stays "Lævateinn Dragon, Attack Form".
  // BP03-SL13 is the alternate art of BP03-058 (docs/data-notes.md).
  "BP03-058": { name_en: "Lævateinn Dragon, Attack Form (Evolved)" },
  "BP03-SL13": { name_en: "Lævateinn Dragon, Attack Form (Evolved)" },
  // The same for the other two forms (レーヴァテインドラゴン・ディフェンスモード / ブラストモード);
  // BP04-SL13 / SL14 are their alternate arts.
  "BP04-061": { name_en: "Lævateinn Dragon, Defense Form (Evolved)" },
  "BP04-SL13": { name_en: "Lævateinn Dragon, Defense Form (Evolved)" },
  "BP04-062": { name_en: "Lævateinn Dragon, Blast Form (Evolved)" },
  "BP04-SL14": { name_en: "Lævateinn Dragon, Blast Form (Evolved)" },
  // "Dazzling Healer (Evolve)": a typo for " (Evolved)". Its Japanese name キラキラヒーラー and
  // class are those of BP04-051 "Dazzling Healer", and its card type is Evolved.
  "BP04-052": { name_en: "Dazzling Healer (Evolved)" },
  // "Akiha Ikebukuro (Evolved)" listed as a plain follower (no cost, "(Evolved)" in its name,
  // On Evolve text).
  "CSD02a-008": { card_type: ["Follower", "Evolved"] },
  "CSD02a-P05": { card_type: ["Follower", "Evolved"] },
  // Chinese traits (自然·指挥官·野兽) in the Japanese field; the alternate printing BP07-SL04
  // has the Japanese traits.
  "BP07-018": { traits_ja: "自然・指揮官・獣" },
  // Back face of BP08-003 (see BP08_003_BACK above).
  "BP08-003": { back: BP08_003_BACK },
  "BP08-SL03": { back: BP08_003_BACK },
  // An evolved card without the " (Evolved)" suffix; its Japanese name 骸の代弁者 is that of the
  // base card BP09-080 "Orator of the Bones", and its card type is Evolved.
  "BP09-081": { name_en: "Orator of the Bones (Evolved)" },
  // The evolved card of BP10-048 "Piquant Potioneer" is named "Potion Wizard (Evolved)", an older
  // translation: both have the Japanese name ポーションウィザード and the Chinese name 魔药巫师, and
  // BP10-048's evolve ability evolves this follower (same name, CR 5.16.1.1.1).
  "BP10-049": { name_en: "Piquant Potioneer (Evolved)" },
  // Evolved cards without the " (Evolved)" suffix: their Japanese names 氷蝕のドラゴン / 機構の撃ち手
  // are those of the base cards BP14-056 "Frostbite Dragon" / BP14-112 "Gunslinger Automaton", and
  // their card type is Evolved.
  "BP14-057": { name_en: "Frostbite Dragon (Evolved)" },
  "BP14-113": { name_en: "Gunslinger Automaton (Evolved)" },
  // "Mechanical Analyzer  (Evolved)" has two spaces, so the name did not match its base card
  // BP15-119 "Mechanical Analyzer" (same Japanese name メカニカルアナライザー, CR 5.16.1.1.1).
  "BP15-120": { name_en: "Mechanical Analyzer (Evolved)" },
  // The English names of these evolved cards lack " (Evolved)"; their Japanese names, traits and class are those of
  // the base cards BP19-005 / P01 "Verdant Lieutenant" (葉脈の舎弟頭) and BP19-082 "Underworld Lieutenant" (冥府の中尉),
  // and their card type is Evolved (CR 5.16.1.1.1).
  "BP19-006": { name_en: "Verdant Lieutenant (Evolved)" },
  "BP19-P02": { name_en: "Verdant Lieutenant (Evolved)" },
  "BP19-083": { name_en: "Underworld Lieutenant (Evolved)" },
  // The same for BP20-024 / P14 (base BP20-023 "Congregant of Usurpation", 簒奪の団結者).
  "BP20-024": { name_en: "Congregant of Usurpation (Evolved)" },
  "BP20-P14": { name_en: "Congregant of Usurpation (Evolved)" },
  // "Lilium, the Witchwyrm (Evolved)": the two halves of the name are swapped. It is the evolved card of BP21-055
  // "Lilium, the Wyrmwitch" — the same Japanese name 竜の魔女・リリウム and Chinese name 龙之魔女·莉莉尤姆 (CR 5.16.1.1.1).
  "BP21-056": { name_en: "Lilium, the Wyrmwitch (Evolved)" },
  "BP21-SL14": { name_en: "Lilium, the Wyrmwitch (Evolved)" },
  // CP02's unit printings (SP / U): the big printed name is the idol unit's name, and the card name is printed in small type
  // above it (assets/CP02-SP01a/CP02-SP01a.webp: 前川みく above *(Asterisk); CP02-SP09a: 神崎蘭子 above フォルトゥナ・レジーナ).
  // Their texts, class, stats and rulings are those of the named card, which an evolved one needs to evolve from its
  // base (CR 5.16.1.1.1). The unit name stays as an alternate name (CR 2.13), shown only.
  // 前川みく (CP02-003) under the unit name *(Asterisk).
  "CP02-SP01a": { treated_as: "Miku Maekawa" },
  "CP02-SP01b": { treated_as: "Miku Maekawa" },
  "CP02-U01a": { treated_as: "Miku Maekawa" },
  "CP02-U01b": { treated_as: "Miku Maekawa" },
  // 久川凪 (CP02-020) under the unit name miroir.
  "CP02-SP04a": { treated_as: "Nagi Hisakawa" },
  "CP02-SP04b": { treated_as: "Nagi Hisakawa" },
  "CP02-U04a": { treated_as: "Nagi Hisakawa" },
  "CP02-U04b": { treated_as: "Nagi Hisakawa" },
  // 塩見周子 (CP02-038) under the unit name 羽衣小町.
  "CP02-SP06a": { treated_as: "Syuko Shiomi" },
  "CP02-SP06b": { treated_as: "Syuko Shiomi" },
  "CP02-U06a": { treated_as: "Syuko Shiomi" },
  "CP02-U06b": { treated_as: "Syuko Shiomi" },
  // 鷺沢文香 (CP02-055) under the unit name BRIGHT:LIGHTS.
  "CP02-SP08a": { treated_as: "Fumika Sagisawa" },
  "CP02-SP08b": { treated_as: "Fumika Sagisawa" },
  "CP02-U08a": { treated_as: "Fumika Sagisawa" },
  "CP02-U08b": { treated_as: "Fumika Sagisawa" },
  // 神崎蘭子 (CP02-070) under the unit name フォルトゥナ・レジーナ.
  "CP02-SP09a": { treated_as: "Ranko Kanzaki" },
  "CP02-SP09b": { treated_as: "Ranko Kanzaki" },
  "CP02-U09a": { treated_as: "Ranko Kanzaki" },
  "CP02-U09b": { treated_as: "Ranko Kanzaki" },
  // 佐藤心 (CP02-088) under the unit name しゅがしゅが☆み〜ん.
  "CP02-SP12a": { treated_as: "Shin Sato" },
  "CP02-SP12b": { treated_as: "Shin Sato" },
  "CP02-U12a": { treated_as: "Shin Sato" },
  "CP02-U12b": { treated_as: "Shin Sato" },
  // ニュージェネレーションズ (CP02-103) under the unit name #UNICUS.
  "CP02-SP13": { treated_as: "New Generations" },
  "CP02-U13a": { treated_as: "New Generations" },
  "CP02-U13b": { treated_as: "New Generations" },
  "CP02-U13c": { treated_as: "New Generations" },
  // Back faces of double-faced cards (see above).
  "BP09-005": { back: BP09_005_BACK },
  "BP09-P02": { back: BP09_005_BACK },
  "BP09-019": { back: BP09_019_BACK },
  "BP09-SL05": { back: BP09_019_BACK },
  "BP09-039": { back: BP09_039_BACK },
  "BP09-P12": { back: BP09_039_BACK },
  "BP09-056": { back: BP09_056_BACK },
  "BP09-P17": { back: BP09_056_BACK },
  "BP09-070": { back: BP09_070_BACK },
  "BP09-SL14": { back: BP09_070_BACK },
  "BP09-090": { back: BP09_090_BACK },
  "BP09-P27": { back: BP09_090_BACK },
};

/** Apply the fix table to one raw card file. */
export function applyDataFixes(raw: RawCardJson): RawCardJson {
  const fix = DATA_FIXES[raw.card_no];
  if (!fix) return raw;
  const { back, ...rest } = fix;
  const fixed: RawCardJson = { ...raw, ...rest };
  if (back) {
    if (!raw.back) throw new Error(`${raw.card_no}: data fix for a back face, but the card has none`);
    fixed.back = { ...raw.back, ...back };
  }
  return fixed;
}
