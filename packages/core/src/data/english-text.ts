import type { RawCardJson } from "./raw";

/**
 * Choosing a printing's English text, and alternate names (CR 2.13).
 *
 * The English text of a card is `effect_en` (decided by the project owner, CLAUDE.md
 * 2026-09-23): it comes from the same record as the Japanese text. `effect_en_official` was
 * matched to cards by card number, which is wrong wherever the English numbering differs from
 * the Japanese one (all PR cards, many alternate-art numbers, whole ranges such as
 * BP02-069..117), so it is only compared against `effect_en` for the report. See
 * docs/data-notes.md.
 */

/** Where a printing's English text comes from ("none": no text, or a Japan-only printing). */
export type TextSource = "effect_en" | "none";

export interface EnglishText {
  text: string;
  source: TextSource;
  /** The printing's official English text describes another card (report only). */
  officialMismatch: boolean;
}

const CJK = /[\u3040-\u30ff\u4e00-\u9fff]/g;
const LETTERS = /[A-Za-z\u3040-\u30ff\u4e00-\u9fff]/g;

/** A text that is actually Japanese (Japan-only printings repeat the Japanese text in the English fields). */
export function isMostlyJapanese(text: string): boolean {
  const letters = text.match(LETTERS)?.length ?? 0;
  return letters > 0 && (text.match(CJK)?.length ?? 0) > 0.2 * letters;
}

function words(text: string): Map<string, number> {
  const normalized = text
    .toLowerCase()
    .replace(/activate/g, " act ")
    .replace(/\{\[([a-z]+?)(\d*)\]\}/g, " $1 $2 ")
    .replace(/[^a-z0-9]+/g, " ");
  const counts = new Map<string, number>();
  for (const w of normalized.split(" ")) if (w) counts.set(w, (counts.get(w) ?? 0) + 1);
  return counts;
}

/** Dice coefficient of the word multisets of two texts (1 = same words). */
export function wordDice(a: string, b: string): number {
  const wa = words(a);
  const wb = words(b);
  let shared = 0;
  let total = 0;
  for (const [w, n] of wa) {
    shared += Math.min(n, wb.get(w) ?? 0);
    total += n;
  }
  for (const n of wb.values()) total += n;
  return total === 0 ? 1 : (2 * shared) / total;
}

/** Card-text icons such as {[fanfare]} (costs excluded), "Activate" counted as {[act]}. */
function icons(text: string): string {
  const found = text.replace(/Activate/g, "{[act]}").match(/\{\[[a-z]+\]\}/g) ?? [];
  return [...found].sort().join("");
}

function numbers(text: string): string {
  return (text.match(/\d+/g) ?? []).map((n) => String(Number(n))).sort().join(",");
}

/**
 * Does the official text describe the same card as `effect_en`? Calibrated on BP01 (all
 * official texts match; lowest similarity 0.625, a rewording) and BP02-069..117 (mismatched;
 * highest similarity 0.63, with a different ability).
 */
export function sameCardText(official: string, unofficial: string): boolean {
  const d = wordDice(official, unofficial);
  return d >= 0.8 || (d >= 0.5 && icons(official) === icons(unofficial) && numbers(official) === numbers(unofficial));
}

export function englishText(raw: RawCardJson): EnglishText {
  const text = raw.effect_en?.trim() ?? "";
  const official = raw.effect_en_official?.trim() ?? "";
  // Japan-only printings repeat the Japanese text in the English fields: no English text then.
  if (text === "" || isMostlyJapanese(text)) return { text: "", source: "none", officialMismatch: false };
  // "(None.)" stands for no card text (BP18-122 / 125: evolved cards whose Japanese text is empty).
  if (text === "(None.)") return { text: "", source: "effect_en", officialMismatch: false };
  // PR official texts are known to belong to other cards; they are not even compared.
  const officialMismatch = raw.set !== "PR" && official !== "" && !sameCardText(official, text);
  return { text, source: "effect_en", officialMismatch };
}

const TREATED_AS = /^\(This card is treated as (.+?)\.\)\s*/;

/**
 * CR 2.13 — "(This card is treated as X.)": the printing's own name is an alternate name and
 * its card name is X (e.g. BP02-070 "La+ Darkness, Laplace's Demon" is Vania, Vampire
 * Princess). Returns X, or null.
 */
export function treatedAs(text: string | null | undefined): string | null {
  return text ? (TREATED_AS.exec(text.trim())?.[1]?.trim() ?? null) : null;
}

/** Drop reminder text in parentheses (starter-deck reprints explain keywords) for comparisons. */
export function withoutReminders(text: string): string {
  return text.replace(/\([^()]*\)/g, "");
}

/** Remove the "(This card is treated as X.)" note (it is not an ability). */
export function withoutTreatedAs(text: string): string {
  return text.trim().replace(TREATED_AS, "");
}

/**
 * Japanese text normalized for comparing printings of the same card: token reminders (after
 * "―――") and reminder text in parentheses (starter-deck reprints explain keywords) dropped.
 */
export function japaneseKey(raw: RawCardJson): string {
  return (raw.effect_ja ?? "")
    .split("―")[0]!
    .replace(/（[^（）]*）|\([^()]*\)/g, "")
    .replace(/[\s\u3000]+/g, "");
}
