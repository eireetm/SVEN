// Trait names (CR 2.4). The Core knows a trait only by its Japanese name, as printed on the Japanese card; the GUI also
// shows and searches traits in English and Chinese (display only, the Core is not involved):
//  - English: the official English card data (each printing's scraped `traits`).
//  - Chinese: as the Chinese card texts write them ("信仰类型·从者"). For traits no card text names, from the Chinese card
//    names that contain them ("竜使い" -> 原初の竜使い = 元祖驭龙使); the rest are translated here, marked "translated".
// New sets bring new traits: test/traits.test.ts lists any trait of the card pool missing here.
import type { CardLang } from "./settings";

export interface TraitNames {
  en: string;
  cn: string;
}

export const TRAIT_NAMES: Readonly<Record<string, TraitNames>> = {
  "獣": { en: "Beast", cn: "野兽" },
  "信仰": { en: "Faith", cn: "信仰" },
  "魔法使い": { en: "Mage", cn: "魔法使" },
  "絶傑": { en: "Omen", cn: "绝杰" },
  "デレマス": { en: "iM@S CG", cn: "IMC" },
  "魔界": { en: "Demon", cn: "魔界" },
  "竜族": { en: "Wyrmkin", cn: "龙裔" },
  "兵士": { en: "Officer", cn: "士兵" },
  "ヴァンガード": { en: "Vanguard", cn: "先导者" },
  "指揮官": { en: "Commander", cn: "指挥官" },
  "ウマ娘": { en: "Umamusume", cn: "赛马娘" },
  "プリコネ": { en: "PriConne", cn: "公主连结" },
  "学院": { en: "Academic", cn: "学院" },
  "超克": { en: "Supreme", cn: "超克" },
  "ドラゴニュート": { en: "Dragonewt", cn: "龙人" },
  "機械": { en: "Machina", cn: "机械" },
  "キラー": { en: "Cutthroat", cn: "杀手" },
  "エルフ族": { en: "Elf", cn: "精灵族" }, // translated (the Chinese card names write エルフ as 精灵)
  "死者": { en: "Departed", cn: "死者" },
  "狩人": { en: "Hunter", cn: "猎人" },
  "狂信": { en: "Zealot", cn: "狂信" },
  "透京": { en: "Togh Keyoh", cn: "透京" },
  "自然": { en: "Natura", cn: "自然" },
  "プリンセス": { en: "Princess", cn: "公主" },
  "クール": { en: "Cool", cn: "Cool" },
  "竜使い": { en: "Dragonheart", cn: "驭龙使" },
  "光輝": { en: "Lightborne", cn: "光辉" },
  "荒野": { en: "Wasteland", cn: "荒野" },
  "八獄": { en: "Condemned", cn: "八狱" },
  "キュート": { en: "Cute", cn: "Cute" },
  "海洋": { en: "Marine", cn: "海洋" },
  "パッション": { en: "Passion", cn: "Passion" },
  "宴楽": { en: "Festive", cn: "宴乐" },
  "精霊": { en: "Fae-Touched", cn: "精灵" },
  "盗賊": { en: "Thief", cn: "盗贼" },
  "死霊術師": { en: "Necromancer", cn: "死灵术师" },
  "吸血鬼": { en: "Vampire", cn: "吸血鬼" },
  "錬金術師": { en: "Alchemist", cn: "炼金术师" }, // the Chinese texts write both; the newest (BP21-T04) and BP22's names 炼金术师
  "アルカナ": { en: "Arcana", cn: "阿尔卡纳" },
  "植物族": { en: "Verdant", cn: "植物族" },
  "天使": { en: "Angel", cn: "天使" },
  "先導": { en: "Luminary", cn: "先导" },
  "童話": { en: "Fable", cn: "童话" },
  "妖精": { en: "Pixie", cn: "妖精" },
  "人形": { en: "Puppetry", cn: "人偶" },
  "武闘竜人": { en: "Draconic Duelist", cn: "武斗龙人" },
  "魔法生物": { en: "Arcanaform", cn: "魔法生物" },
  "大神": { en: "Deity", cn: "大神" },
  "鳥族": { en: "Avian", cn: "鸟族" },
  "傭兵": { en: "Mercenary", cn: "佣兵" },
  "禁忌": { en: "Forbidden", cn: "禁忌" },
  "ゴーレム": { en: "Golem", cn: "巨像" },
  "星神": { en: "Celestial", cn: "星神" },
  "ロイヤルパラディン": { en: "Royal Paladin", cn: "光辉骑士团" },
  "かげろう": { en: "Kagero", cn: "阳炎" },
  "偶像": { en: "Eidolon", cn: "偶像" },
  "挑戦者": { en: "Arena", cn: "挑战者" },
  "アイドル": { en: "Idolatry", cn: "爱豆" },
  "商人": { en: "Merchant", cn: "商人" },
  "レヴィオン": { en: "Levin", cn: "雷维翁" },
  "武装": { en: "Armed", cn: "武装" },
  "アクアフォース": { en: "Aqua Force", cn: "苍海军势" },
  "ペイルムーン": { en: "Pale Moon", cn: "黯月" },
  "シャドウパラディン": { en: "Shadow Paladin", cn: "暗影骑士团" },
  "オラクルシンクタンク": { en: "Oracle Think Tank", cn: "占卜魔法团" },
  "堕天使": { en: "Fallen Angel", cn: "堕天使" },
  "ゴブリン": { en: "Goblinoid", cn: "哥布林" },
  "暗殺者": { en: "Assassin", cn: "暗杀者" },
  "貴族": { en: "Noble", cn: "贵族" },
  "継承者": { en: "Heir", cn: "继承者" },
  "巨人": { en: "Gigant", cn: "巨人" },
  "チェス": { en: "Chess", cn: "西洋棋" },
  "シンガー": { en: "Musical", cn: "歌手" }, // translated
  "土の印": { en: "Earth Sigil", cn: "土之印" },
  "探偵": { en: "Detective", cn: "侦探" },
  "美食殿": { en: "Gourmet Guild", cn: "美食殿堂" }, // translated
  "ヒーロー": { en: "Heroic", cn: "英雄" },
  "メイド": { en: "Maid", cn: "女仆" },
  "陰陽師": { en: "Onmyoji", cn: "阴阳师" },
  "妖怪": { en: "Yokai", cn: "妖怪" },
  "魔王": { en: "Archfiend", cn: "魔王" },
  "虫族": { en: "Insect", cn: "虫族" },
  "コック": { en: "Chef", cn: "厨师" },
  "ゴルゴーン": { en: "Gorgon", cn: "戈尔贡" },
  "メジロ家": { en: "Mejiro Family", cn: "目白家" },
  "ディアボロス": { en: "Diabolos", cn: "恶魔伪王国军" },
  "不死鳥": { en: "Phoenix", cn: "不死鸟" },
  "クリスタリア": { en: "Crystalian", cn: "冰晶" },
  "トレセン学園": { en: "Tracen Academy", cn: "特雷森学园" },
  "七冠": { en: "Seven Crowns", cn: "七冠" },
  "財宝": { en: "Loot", cn: "财宝" },
  "アナテマ": { en: "Anathema", cn: "安纳提玛" },
  "忍者": { en: "Ninja", cn: "忍者" },
  "ダンサー": { en: "Dancer", cn: "舞者" }, // translated
  "NIGHTMARE": { en: "Nightmare", cn: "王宫骑士团" },
  "悪魔": { en: "Fiend", cn: "恶魔" },
  "ルミナス": { en: "Luminous", cn: "鲁米那斯" },
  "区役所": { en: "Ward Office", cn: "区役所" },
  "エリザベスパーク": { en: "Elizabeth Park", cn: "伊丽莎白牧场" },
  "カォン": { en: "Caon", cn: "卡恩" }, // translated
  "メルクリウス財団": { en: "Mercurius Foundation", cn: "墨丘利财团" }, // translated
  "ドラゴンズネスト": { en: "Dragon's Nest", cn: "龙族据点" },
  "サレンディア救護院": { en: "Sarendia Orphanage", cn: "咲恋救济院" },
  "円卓": { en: "Arthurian", cn: "圆桌" },
  "マグナ": { en: "Magna", cn: "神伟" },
  "乗物": { en: "Mount", cn: "载具" },
  "ラビリンス": { en: "Labyrinth", cn: "迷宫" }, // translated
  "〈ジオ・テオゴニア〉": { en: "Geo Theogonia", cn: "〈吉奥·特尔哥尼亚〉" },
  "トワイライトキャラバン": { en: "Twilight Caravan", cn: "暮光商队" }, // translated
  "ヴァイスフリューゲル": { en: "Weissflugel", cn: "白翼" }, // translated
  "なかよし部": { en: "Friendship Club", cn: "好朋友社" },
  "リトルリリカル": { en: "Little Lyrical", cn: "小小甜心" }, // translated
  "BNW": { en: "BNW", cn: "BNW" },
  "ルーセント学院": { en: "Lucent Academy", cn: "月光学院" },
  "トゥインクルウィッシュ": { en: "Twinkle Wish", cn: "破晓之星" },
  "カルミナ": { en: "Carmina", cn: "慈乐之音" },
  "式神": { en: "Shikigami", cn: "式神" },
  "アサイラント": { en: "Encroacher", cn: "侵袭者" }, // translated
  "〈レイジ・レギオン〉": { en: "Rage Legion", cn: "〈狂怒军团〉" }, // translated
  "フォレスティエ": { en: "Forestier", cn: "森林守卫" }, // translated
  "アルターメイデン": { en: "Alter Maiden", cn: "奥尔特少女" }, // translated
  "〈ジオ・ゲヘナ〉": { en: "Geo Gehenna", cn: "〈吉奥·格赫纳〉" }, // translated (as 〈吉奥·特尔哥尼亚〉)
  "〈ジオ・ニヴルヘル〉": { en: "Geo Niflhel", cn: "〈吉奥·尼弗尔海姆〉" },
  "プリンス": { en: "Prince", cn: "王子" }, // translated
  "リッチモンド商工会": { en: "Richmond Corporation", cn: "里士满商会" }, // translated
  "ギルド管理協会": { en: "Guild Association", cn: "公会管理协会" }, // translated
};

/** A trait's name in a card language (the Japanese one when there is no translation). */
export function traitName(trait: string, lang: CardLang): string {
  return lang === "ja" ? trait : (TRAIT_NAMES[trait]?.[lang] ?? trait);
}

/** Every name of a trait (Japanese, English, Chinese), for searching. */
export function traitNames(trait: string): string[] {
  const names = TRAIT_NAMES[trait];
  return names ? [trait, names.en, names.cn] : [trait];
}
