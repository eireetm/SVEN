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
  // An evolved card without the " (Evolved)" suffix; its Japanese name 骸の代弁者 is that of the
  // base card BP09-080 "Orator of the Bones", and its card type is Evolved.
  "BP09-081": { name_en: "Orator of the Bones (Evolved)" },
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
