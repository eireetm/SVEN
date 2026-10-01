// Which line of a card's text an automatic ability is, so that a choice between abilities can show what each one says
// (two Fanfares of one card read the same by their timing alone). Pure: test/ability-text.test.ts checks it against every
// card.
//  - A timing with a mark (Fanfare, Last Words, On Evolve ...): the n-th line that starts with the mark is the card's n-th
//    ability with that timing, in the order its script lists them. The card languages put the paragraphs in different
//    orders (the English one often differs from the Japanese and Chinese), but the abilities of one timing keep their order
//    among themselves.
//  - Other triggers have no mark: OTHER_LINES says it for the cards with more than one (with one, its card's name says
//    which ability it is).
import type { CardLang } from "../../app/settings";

/**
 * What may come before a timing's mark at the start of a line: other icons and keywords (UB, 【...】, 《...》), and another
 * timing's mark ("{[fanfare]}/{[lastwords]}", "ファンファーレラストワード").
 */
const HEAD: Record<CardLang, string> = {
  en: String.raw`(?:\{\[[a-z0-9]+\]\}[\s/,]*)*`,
  cn: String.raw`(?:[《【][^》】]*[》】][/／]?)*`,
  ja: String.raw`(?:UB|[《【][^》】]*[》】]|ファンファーレ|ラストワード|[/／])*`,
};

/** Each timing's mark in each card language: the spellings the card data has (older sets bracket some of them). */
const MARKS: Readonly<Record<string, Record<CardLang, string>>> = {
  fanfare: { en: String.raw`\{\[fanfare\]\}`, cn: "[《【]入场曲[》】]", ja: "《?ファンファーレ》?" },
  lastWords: { en: String.raw`\{\[lastwords\]\}`, cn: "[《【]谢幕曲[》】]", ja: "《?ラストワード》?" },
  onEvolve: { en: String.raw`On Evolve\b`, cn: "【进化时】", ja: "【進化時】" },
  onSuperEvolve: { en: String.raw`On+ Super[- ]?Evolve\b`, cn: "【超进化时】", ja: "【超進化時】" },
  strike: { en: String.raw`(?:Follower )?Strike\b`, cn: "【攻击时】", ja: "【攻撃時】" },
  onRace: { en: String.raw`On Race\b`, cn: "【起跑时】", ja: "【出走時】" },
  onDrive: { en: String.raw`On Drive\b`, cn: "【驱动获得时】", ja: "【ドライブ獲得時】" },
};

const patterns = new Map<string, RegExp>();
function pattern(timing: string, lang: CardLang): RegExp | null {
  const mark = MARKS[timing]?.[lang];
  if (!mark) return null;
  const key = `${timing}:${lang}`;
  let re = patterns.get(key);
  if (!re) patterns.set(key, (re = new RegExp(`^${HEAD[lang]}${mark}`)));
  return re;
}

/**
 * The cards with more than one automatic ability without a mark ("other"): for each language, the line of the card text
 * each one is (by its index in that language's text), in the order the card's script lists them. Two abilities on one line
 * are one sentence the script splits (BP09-002: a Beast or another follower). The Japanese and Chinese texts list some in
 * another order than the English one (BP10-004, BP14-059). A new card with more than one is listed by the test.
 */
export const OTHER_LINES: Readonly<Record<string, Partial<Record<CardLang, readonly number[]>>>> = {
  "BP03-075": { en: [0, 1], cn: [0, 1], ja: [0, 1] },
  "BP07-088": { en: [1, 2], cn: [1, 2], ja: [1, 2] },
  "BP09-002": { en: [1, 1], cn: [1, 1], ja: [1, 1] },
  "BP09-095": { en: [0, 1], cn: [0, 1], ja: [0, 1] },
  "BP10-004": { en: [1, 2], cn: [1, 0], ja: [1, 0] },
  "BP10-066": { en: [0, 2], cn: [0, 1], ja: [0, 1] },
  "BP11-070": { en: [1, 2], cn: [0, 1], ja: [0, 1] },
  "BP12-010": { en: [0, 0], cn: [0, 0], ja: [0, 0] },
  "BP12-063": { en: [0, 3], cn: [0, 2], ja: [0, 2] },
  "BP14-059": { en: [1, 2], cn: [1, 0], ja: [1, 0] },
  "BP14-102": { en: [1, 2], cn: [1, 2], ja: [1, 2] },
  "BP18-027": { en: [2, 2], cn: [1, 1], ja: [1, 1] },
  "BP20-T02": { en: [0, 0], cn: [0, 0], ja: [0, 0] },
  "BP21-037": { en: [0, 1], cn: [0, 1], ja: [0, 1] },
  "BP21-075": { en: [0, 1], cn: [0, 1], ja: [0, 1] },
  "CP03-064": { en: [0, 1], cn: [0, 1], ja: [0, 1] },
  // The second is the delayed trigger its Fanfare sets up (that line says it).
  "BP22-037": { cn: [1, 2], ja: [1, 2] },
};

/** The lines of a card's text that start with a timing's mark, in order (none for a timing without a mark: "other"). */
export function markedLines(text: string, lang: CardLang, timing: string): string[] {
  const re = pattern(timing, lang);
  return re ? text.split("\n").filter((line) => re.test(line.trim())) : [];
}

/**
 * The line of a card's text (card `def`) that is one of its automatic abilities: the one with this timing and rank (0: the
 * card's first ability with that timing) of the `count` it has. Null when the text doesn't tell: a trigger without a mark
 * that OTHER_LINES doesn't list, or a text with another number of marked lines than the card has abilities (a translation
 * that splits one ability in two, a mark inside another ability's text).
 */
export function abilityLine(def: string, text: string, lang: CardLang, timing: string, rank: number, count: number): string | null {
  if (timing === "other") {
    const index = OTHER_LINES[def]?.[lang]?.[rank];
    return index === undefined ? null : text.split("\n")[index]?.trim() || null;
  }
  const lines = markedLines(text, lang, timing);
  return lines.length === count ? (lines[rank]?.trim() ?? null) : null;
}
