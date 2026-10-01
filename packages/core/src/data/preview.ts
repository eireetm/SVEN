import type { CardClass, Universe } from "../model/card";
import { CardDataError } from "./normalize";
import type { RawCardJson, RawRuling } from "./raw";

/**
 * Pre-release sets ("先行" data): a set published in Japanese and Chinese before its English release comes as one file
 * of the Japanese official card list instead of the scraped `assets/<card>/<card>.json` files, e.g. BP22 (2026-10-01,
 * docs/NOTE-card-scripts.md section 10). Its cards are implemented from the Japanese text, checked against the Chinese
 * text (decided by the project owner); their English name and text are a placeholder (english-text.ts PREVIEW_TEXT)
 * until the English data is out, when the set leaves this list and is built from the scraped files like every other.
 *
 * Pure functions: the build tool (tools/build-card-data.ts) reads the files.
 */

/** Pre-release sets and their files, in the folder that holds the assets folder (D:\SVE\BP22.json). */
export const PREVIEW_SETS: Readonly<Record<string, string>> = {
  BP22: "BP22.json",
};

/**
 * One card of a pre-release file. Only the fields the build needs: the release date, rarity, product name, flavor text
 * and illustrator are not game information (CR 2.10–2.12) and are ignored.
 */
export interface PreviewCard {
  カード番号: string;
  カード名: string;
  クラス: string;
  カード種類: string;
  タイプ: string;
  コスト: string;
  攻撃力: string;
  体力: string;
  能力: string;
  effect_cn: string | null;
  "Q&A"?: readonly { 番号: string; 日付: string; Q: string; A: string }[];
}

export interface PreviewSetFile {
  収録コード: string;
  カード: readonly PreviewCard[];
}

/** What a card is, for finding it among the scraped cards by its Japanese name. */
export interface PreviewKind {
  type: string;
  evolved: boolean;
  token: boolean;
  advanced: boolean;
}

/**
 * The English name of the scraped card with this Japanese name and kind (a reprint, e.g. BP22-T05 フェアリー is BP01-T03
 * Fairy), or null for a card the scraped data doesn't have.
 */
export type EnglishNameOf = (japaneseName: string, kind: PreviewKind) => string | null;

/** CR 2.2 — the Japanese class names. */
const CLASSES: Readonly<Record<string, CardClass>> = {
  ニュートラル: "Neutral",
  エルフ: "Forestcraft",
  ロイヤル: "Swordcraft",
  ウィッチ: "Runecraft",
  ドラゴン: "Dragoncraft",
  ナイトメア: "Abysscraft",
  ビショップ: "Havencraft",
};

/** CR 2.3 — the Japanese card types ("フォロワー・エボルヴ": an evolved follower), as the scraped `card_type`. */
const CARD_TYPES: Readonly<Record<string, readonly string[]>> = {
  フォロワー: ["Follower"],
  スペル: ["Spell"],
  アミュレット: ["Amulet"],
  リーダー: ["Leader"],
  "フォロワー・エボルヴ": ["Follower", "Evolved"],
  "アミュレット・エボルヴ": ["Amulet", "Evolved"],
  "フォロワー・アドバンス": ["Follower", "Advanced"],
  "スペル・アドバンス": ["Spell", "Advanced"],
  "フォロワー・トークン": ["Follower", "Token"],
  "スペル・トークン": ["Spell", "Token"],
  "アミュレット・トークン": ["Amulet", "Token"],
};

/**
 * CR 2.12.2.1 — the universe is printed with the collector number, and the pre-release data has no field for it. Every
 * card of the scraped data with one of these traits belongs to that universe (and only universe cards have them), e.g.
 * BP22-116 〔勝利目指して〕ハルウララ, a Forestcraft collaboration follower with Serve (CR 14.2).
 */
const UNIVERSE_TRAITS: Readonly<Record<string, Universe>> = {
  ウマ娘: "umamusume",
  デレマス: "cinderellaGirls",
  ヴァンガード: "vanguard",
  プリコネ: "princessConnect",
};

function number(cardNo: string, field: string, raw: string): number | null {
  const s = raw.trim();
  if (s === "-" || s === "") return null;
  if (!/^\d+$/.test(s)) throw new CardDataError(`${cardNo}: ${field} "${raw}" is not a number`);
  return Number(s);
}

const quoted = (text: string): string[] => [...text.matchAll(/『([^』]+)』/g)].map((m) => m[1]!);

/**
 * Chinese card names, from the Chinese texts: a text names other cards in 『』 in the same order as the Japanese text
 * (e.g. BP22-005 『ブリリアントフェアリー』 / 『璀璨妖精』). The token explanations after "―" (Japanese) / "*『"
 * (Chinese) are left out, as texts whose numbers of names differ. A name translated two ways is not used.
 */
export function chineseNamesFromTexts(cards: readonly PreviewCard[]): Map<string, string> {
  const found = new Map<string, Set<string>>();
  for (const c of cards) {
    const ja = quoted(c.能力.split("―")[0]!);
    const cn = quoted((c.effect_cn ?? "").split("*『")[0]!);
    if (ja.length === 0 || ja.length !== cn.length) continue;
    ja.forEach((name, i) => found.set(name, (found.get(name) ?? new Set()).add(cn[i]!)));
  }
  return new Map([...found].flatMap(([ja, cn]) => (cn.size === 1 ? [[ja, [...cn][0]!] as [string, string]] : [])));
}

/**
 * The cards of a pre-release file as scraped card files: the Japanese text for both `effect_ja` fields (the file writes
 * the icons as words, like `effect_ja_sve`), the Chinese text, the rulings with their numbers. `englishNameOf` names the
 * reprints of scraped cards, so that they join those cards (normalize.ts groupPrintings); every other card is new and is
 * named by its Japanese name.
 */
export function previewRawCards(file: PreviewSetFile, englishNameOf: EnglishNameOf = () => null): RawCardJson[] {
  const set = file.収録コード;
  const chinese = chineseNamesFromTexts(file.カード);
  return file.カード.map((c): RawCardJson => {
    const cardNo = c.カード番号;
    if (!cardNo.startsWith(`${set}-`)) throw new CardDataError(`${cardNo}: not a printing of ${set}`);
    const cls = CLASSES[c.クラス];
    if (!cls) throw new CardDataError(`${cardNo}: unknown class "${c.クラス}"`);
    const cardType = CARD_TYPES[c.カード種類];
    if (!cardType) throw new CardDataError(`${cardNo}: unknown card type "${c.カード種類}"`);
    const kind: PreviewKind = {
      type: cardType[0]!.toLowerCase(),
      evolved: cardType.includes("Evolved"),
      token: cardType.includes("Token"),
      advanced: cardType.includes("Advanced"),
    };
    const english = englishNameOf(c.カード名, kind);
    const traits = c.タイプ.trim();
    const universe = traits.split("・").map((t) => UNIVERSE_TRAITS[t]).find((u) => u !== undefined);
    const text = c.能力.trim();
    const rulings: RawRuling[] = (c["Q&A"] ?? []).map((q) => ({ q: `${q.番号} ${q.Q}`, a: q.A }));
    return {
      card_no: cardNo,
      // CR 5.16.1.1.1: the scraped data names an evolved card "<name> (Evolved)" (normalize.ts).
      name_en: english === null ? "" : kind.evolved ? `${english} (Evolved)` : english,
      name_ja: c.カード名,
      name_cn: chinese.get(c.カード名) ?? null,
      set,
      rarity: "",
      class: cls,
      card_type: [...cardType],
      traits: null,
      traits_ja: traits,
      cost: number(cardNo, "コスト", c.コスト),
      atk: number(cardNo, "攻撃力", c.攻撃力),
      def: number(cardNo, "体力", c.体力),
      effect_en: null,
      effect_en_official: null,
      effect_ja: text === "" ? null : text,
      effect_ja_sve: text === "" ? null : text,
      effect_cn: c.effect_cn?.trim() || null,
      flavor_text_ja: null,
      flavor_text_en: null,
      illustrator: null,
      rulings: rulings.length > 0 ? rulings : null,
      image: "",
      preview: true,
      ...(universe ? { universe } : {}),
    };
  });
}
