import type { RawCardBack, RawCardJson } from "./raw";
import { MAGICAL_ITEM } from "./universes";

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
  // The evolved card of CP04-095 "Yui" (and its reprints) without the " (Evolved)" suffix: the same Japanese name ユイ,
  // class and traits, and its card type is Evolved (CR 5.16.1.1.1).
  "CP04-096": { name_en: "Yui (Evolved)" },
  "CP04-P72": { name_en: "Yui (Evolved)" },
  "PR-500": { name_en: "Yui (Evolved)" },
  // A doubled space before " (Evolved)" leaves the evolved card of ECP02-006 "Riina Tada [Wannabe Legend]" without a base card
  // of its name (CR 5.16.1.1.1); the Japanese names are the same 〔ワナビー・レジェンド〕多田李衣菜.
  "ECP02-007": { name_en: "Riina Tada [Wannabe Legend] (Evolved)" },
  "ECP02-P02": { name_en: "Riina Tada [Wannabe Legend] (Evolved)" },
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
  // CP04's SP / U printings of three cards carry the big name of the characters shown together, with the card name in
  // small type above it (assets/CP04-SP06a: ユニ above ユニ＆クロエ＆チエル; CP04-SP10a: ランファ; CP04-SP12a: ノゾミ), and
  // the texts, class, stats and traits of that card — the same case as CP02's unit printings.
  // ユニ (CP04-039) under ユニ＆クロエ＆チエル.
  "CP04-SP06a": { treated_as: "Yuni" },
  "CP04-SP06b": { treated_as: "Yuni" },
  "CP04-SP06c": { treated_as: "Yuni" },
  "CP04-U06": { treated_as: "Yuni" },
  // ランファ (CP04-075) under ランファ＆ミソラ.
  "CP04-SP10a": { treated_as: "Ranpha" },
  "CP04-SP10b": { treated_as: "Ranpha" },
  "CP04-U10": { treated_as: "Ranpha" },
  // ノゾミ (CP04-093) under ノゾミ＆チカ＆ツムギ.
  "CP04-SP12a": { treated_as: "Nozomi" },
  "CP04-SP12b": { treated_as: "Nozomi" },
  "CP04-SP12c": { treated_as: "Nozomi" },
  "CP04-U12": { treated_as: "Nozomi" },
  // The leader 〔プリンセスフォーム〕ペコリーヌ is listed as Forestcraft; its printed class icon is Swordcraft's crown
  // (assets/CP04-PR02/CP04-PR02.webp; Forestcraft's is the leaf of CP04-PR01), as for CP04-PR09 of the same name.
  "CP04-PR02": { class: "Swordcraft" },
  // ECP01's scene printings of Carrot (CP01-085): the printed card shows the EVOLVE banner, the scene's title in big type
  // and the card name にんじん in small type above it (assets/ECP01-058/ECP01-058.webp … ECP01-062), with Carrot's deck
  // limit text. The scraped card type lacks "Evolved" (an evolve-deck card, CR 14.2.1.1).
  ...Object.fromEntries(
    ["ECP01-058", "ECP01-059", "ECP01-060", "ECP01-061", "ECP01-062", "ECP01-SL27", "ECP01-SL28", "ECP01-SL29", "ECP01-SL30", "ECP01-SL31"].map(
      (p) => [p, { card_type: ["Spell", "Evolved"], treated_as: "Carrot" }],
    ),
  ),
  // ECP02's SP / U printings: the big printed name is a new title or the idol unit's name, and the card name is printed in
  // small type above it (assets/ECP02-SP01: 〔渚の花嫁〕新田美波 above 〔女神は朝焼けの海に〕新田美波; ECP02-U03a: 〔シンデレラガール〕
  // 渋谷凛 above 凛＆未央; ECP02-SP09: 〔シンデレラガール〕神崎蘭子; ECP02-U05a: 〔アタシ★スタイル〕城ヶ崎美嘉; ECP02-U07b:
  // 〔すく×2あかりんご〕辻野あかり), with that card's texts, class, stats and traits — the same case as CP02's unit printings.
  ...Object.fromEntries(
    (
      [
        ["Minami Nitta [Water's Edge Bride]", ["SP01", "U01"]],
        ["Yuki Himekawa [Full Swing☆Cheer]", ["SP02", "U02"]],
        ["Rin Shibuya [Cinderella Girl]", ["SP03a", "SP03b", "U03a", "U03b"]],
        ["Uzuki Shimamura [Cinderella Girl]", ["SP04", "U04"]],
        ["Mika Jougasaki [My★Style]", ["SP05a", "SP05b", "U05a", "U05b"]],
        ["Yuuki Otokura [Together with Me]", ["SP06", "U06"]],
        ["Akari Tsujino [Twice as Lovely]", ["SP07a", "SP07b", "U07a", "U07b"]],
        ["Riamu Yumemi [Party Night]", ["SP08", "U08"]],
        ["Ranko Kanzaki [Cinderella Girl]", ["SP09", "U09"]],
        ["Asuka Ninomiya [Sweet & Charming]", ["SP10", "U10"]],
        ["Eve Santaclaus [Cinderella Girl]", ["SP11", "U11"]],
        ["Miyu Mifune [Rouge Couture]", ["SP12", "U12"]],
      ] as const
    ).flatMap(([name, printings]) => printings.map((p) => [`ECP02-${p}`, { treated_as: name }])),
  ),
  // ECP02's tokens T01–T14 (and SL34–SL47) are Magical Items: the card name 魔法のアイテム is printed in small type above the
  // idol's name (assets/ECP02-T01: 魔法のアイテム above 〔ラブレター〕五十嵐響子), and ruling Q3 says so (CR 14.3.1.1). Their text
  // lacks the reminder of the starting Magical Items.
  ...Object.fromEntries(
    Array.from({ length: 14 }, (_, i) => String(i + 1).padStart(2, "0")).flatMap((n) => [
      [`ECP02-T${n}`, { treated_as: MAGICAL_ITEM }],
      [`ECP02-SL${34 + Number(n) - 1}`, { treated_as: MAGICAL_ITEM }],
    ]),
  ),
  // PR printings of CINDERELLA GIRLS cards with a new title, scraped with Japanese data only (no traits): the card name is printed
  // in small type above the title (assets/PR-435: アナスタシア; PR-436: 前川みく; PR-437: 女神は朝焼けの海に; PR-439:
  // 〔ポジティブパッション〕本田未央; PR-442: 〔シンデレラガール〕十時愛梨; PR-148: ぶちあがれ感情; PR-149: ラストデイライト), with that
  // card's text, class and stats.
  "PR-148": { treated_as: "Unbound Emotion" },
  "PR-149": { treated_as: "Last Daylight" },
  "PR-435": { treated_as: "Anastasia" },
  "PR-436": { treated_as: "Miku Maekawa" },
  "PR-437": { treated_as: "Goddess by the Sunlit Sea" },
  "PR-438": { treated_as: "Miho Kohinata [P.C.S]" },
  "PR-439": { treated_as: "Mio Honda [Positive Passion]" },
  "PR-440": { treated_as: "Center Street" },
  "PR-441": { treated_as: "Whispers of a Dream" },
  "PR-442": { treated_as: "Airi Totoki [Cinderella Girl]" },
  // Magical Items (small type 魔法のアイテム, assets/PR-155), Japanese data only.
  "PR-155": { treated_as: MAGICAL_ITEM },
  "PR-156": { treated_as: MAGICAL_ITEM },
  // スパークルアサルト: small type 烈火の魔弾 (assets/PR-406), BP02-112 Surefire Bullet's text, cost and trait.
  "PR-406": { treated_as: "Surefire Bullet" },
  // The evolved 静寂のアナテマ・ギルダリア (EVOLVE banner, assets/PR-559) — BP19-022's evolved card — scraped with the Japanese name
  // plus "（EVOLVE）" and no traits.
  "PR-559": { name_en: "Gildaria, Anathema of Peace (Evolved)", name_ja: "静寂のアナテマ・ギルダリア" },
  // PCS01's evolved printings named after units: the card name in small type (assets/PCS01-005: リノ; PCS01-019: キョウカ;
  // PCS01-040: サレン), the texts of CP04's evolved cards.
  "PCS01-005": { treated_as: "Rino" },
  "PCS01-019": { treated_as: "Kyoka" },
  "PCS01-040": { treated_as: "Saren" },
  // The evolved プリンセスナイト (PCS01-048 Princess Knight's evolved card) has only a Japanese name.
  "PCS01-049": { name_en: "Princess Knight (Evolved)", name_ja: "プリンセスナイト" },
  // アンの大魔法 has only Japanese data; BP21-039 and DSD01a-001 call it "Anne's Sorcery" in English (『アンの大魔法』 in Japanese).
  "DSD01a-008": { name_en: "Anne's Sorcery", name_ja: "アンの大魔法" },
  "DSD01a-P02": { name_en: "Anne's Sorcery", name_ja: "アンの大魔法" },
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
  // BP22 (pre-release data, data/preview.ts): Chinese texts missing a word. BP22-051's Chinese text is empty and its Japanese
  // text is only 【疾走】, which this set's Chinese texts write 【疾驰】 (BP22-034, 117). BP22-085's lacks the Fanfare icon its
  // Japanese text starts with (ファンファーレ, 《入场曲》 in this set's Chinese texts, e.g. BP22-090).
  "BP22-051": { effect_cn: "【疾驰】" },
  "BP22-P28": { effect_cn: "【疾驰】" },
  "BP22-085": {
    effect_cn:
      "《入场曲》从下述之中抉择1项。\n【1】使这张卡《攻击力》+1。\n【2】使这张卡获得【疾驰】能力。\n【3】《消费1》：从自己的牌堆之中搜寻1张『福金与雾尼』卡，并召唤到场上。",
  },
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
