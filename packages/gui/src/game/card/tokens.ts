import type { CardLang } from "../../app/settings";

// Labels of the {[...]} icons of card text, in the card text's language. A picture in public/textures/icons/<name>.png
// replaces a label (README "Custom resources").
const LABELS: Record<CardLang, Record<string, string>> = {
  en: {
    fanfare: "Fanfare",
    lastwords: "Last Words",
    evolve: "Evolve",
    act: "Act",
    engage: "Engage",
    quick: "Quick",
    q: "Quick",
    attack: "ATK",
    defense: "DEF",
    feed: "Feed",
    ub: "UB",
    ride: "Ride",
    adv: "Advanced",
    forestcraft: "Forestcraft",
    swordcraft: "Swordcraft",
    runecraft: "Runecraft",
    dragoncraft: "Dragoncraft",
    abysscraft: "Abysscraft",
    havencraft: "Havencraft",
  },
  cn: {
    fanfare: "入场曲",
    lastwords: "谢幕曲",
    evolve: "进化",
    act: "起动",
    engage: "横置",
    quick: "快速",
    q: "快速",
    attack: "攻击力",
    defense: "生命值",
    feed: "吃饭",
    ub: "UB",
    ride: "凭依",
    adv: "高等起动",
    forestcraft: "精灵职业",
    swordcraft: "皇家护卫职业",
    runecraft: "巫师职业",
    dragoncraft: "龙族职业",
    abysscraft: "梦魇职业",
    havencraft: "主教职业",
  },
  ja: {
    fanfare: "ファンファーレ",
    lastwords: "ラストワード",
    evolve: "進化",
    act: "起動",
    engage: "アクト",
    quick: "クイック",
    q: "クイック",
    attack: "攻撃力",
    defense: "体力",
    feed: "出走",
    ub: "UB",
    ride: "憑依",
    adv: "アドバンス起動",
    forestcraft: "エルフ",
    swordcraft: "ロイヤル",
    runecraft: "ウィッチ",
    dragoncraft: "ドラゴン",
    abysscraft: "ナイトメア",
    havencraft: "ビショップ",
  },
};

/** A card-text icon's label ("cost03": "(3)", "消费3", "コスト3"). */
export function tokenLabel(name: string, lang: CardLang): string {
  const cost = /^cost(\d+|X)$/i.exec(name);
  if (cost) {
    const n = /^\d+$/.test(cost[1]!) ? String(Number(cost[1])) : cost[1]!;
    return lang === "en" ? `(${n})` : lang === "cn" ? `消费${n}` : `コスト${n}`;
  }
  return LABELS[lang][name] ?? LABELS.en[name] ?? name;
}

/** Text with its {[...]} icons as their labels (plain text: buttons, titles). */
export const withTokenLabels = (text: string, lang: CardLang): string =>
  text.replace(/\{\[([^\]]+)\]\}/g, (_all, name: string) => tokenLabel(name, lang));
