import type { CardLang } from "../../app/settings";
import { iconUrl } from "../../resources/lookup";

// Labels of the {[...]} icons of card text, in the card text's language. A picture in public/textures/icons/<name>.png
// replaces a label (public/README.md).
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

export function tokenLabel(name: string, lang: CardLang): string {
  const cost = /^cost(\d+|X)$/i.exec(name);
  if (cost) {
    const n = /^\d+$/.test(cost[1]!) ? String(Number(cost[1])) : cost[1]!;
    return lang === "en" ? `(${n})` : lang === "cn" ? `消费${n}` : `コスト${n}`;
  }
  return LABELS[lang][name] ?? LABELS.en[name] ?? name;
}

function Token({ name, lang }: { name: string; lang: CardLang }) {
  const label = tokenLabel(name, lang);
  const icon = iconUrl(name);
  if (icon) return <img className="sve-token-icon" src={icon} alt={label} title={label} />;
  const kind = /^cost/i.test(name) ? "cost" : name.endsWith("craft") ? "class" : name;
  return <span className={`sve-token sve-token-${kind}`}>{label}</span>;
}

/** Card text with its icons; one paragraph per line. */
export function CardText({ text, lang }: { text: string; lang: CardLang }) {
  return (
    <div className="sve-card-text">
      {text.split("\n").map((line, i) => (
        <p key={i}>
          {line.split(/(\{\[[^\]]+\]\})/g).map((part, j) => {
            const token = /^\{\[([^\]]+)\]\}$/.exec(part);
            return token ? <Token key={j} name={token[1]!} lang={lang} /> : part;
          })}
        </p>
      ))}
    </div>
  );
}
