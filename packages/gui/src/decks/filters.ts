// The deck builder's card pool: which cards the filters let through, and in which order (pure functions: tested in Node).
import type { CardDefinition } from "@sve/core";
import { isDeckCard } from "./model";

export type PoolCard = Pick<CardDefinition, "id" | "printings" | "name" | "names" | "class" | "type" | "evolved" | "advanced" | "token" | "frontFace" | "universe" | "traits" | "cost" | "text">;

/** The type filter: the card types of a deck, plus "evolve" for everything that goes into the evolve deck. */
export type TypeFilter = "any" | "follower" | "spell" | "amulet" | "evolve";

export interface PoolFilters {
  /**
   * Words that must all match (a card number prefix, or part of a name in any language or of the card text); a word
   * starting with "-" must not match.
   */
  text: string;
  class: string;
  type: TypeFilter;
  /** "any", "0" … "9", or "10" for 10 and more. */
  cost: string;
  /** A set code ("BP01"): any printing of the card in it. */
  set: string;
  /** "any", "none" (class-based cards) or a universe. */
  universe: string;
  /** Part of a trait (traits are Japanese, as in the card data). */
  trait: string;
  sort: "number" | "cost" | "name";
}

export const NO_FILTERS: PoolFilters = { text: "", class: "any", type: "any", cost: "any", set: "any", universe: "any", trait: "", sort: "number" };

/** The set code of a printing number ("BP01-001" -> "BP01", "BP03-LDⓈ01" -> "BP03"). */
export const setOf = (printing: string): string => printing.split("-")[0] ?? printing;

/**
 * The set codes of the pool: the sets cards come from, in the order the cards come (the supported sets' order), then the
 * sets that only reprint cards (starter decks, promos).
 */
export function setsOf(cards: readonly PoolCard[]): string[] {
  const home = new Set<string>();
  for (const card of cards) home.add(setOf(card.id));
  const reprints = new Set<string>();
  for (const card of cards) for (const p of card.printings) if (!home.has(setOf(p))) reprints.add(setOf(p));
  return [...home, ...reprints];
}

export function traitsOf(cards: readonly PoolCard[]): string[] {
  return [...new Set(cards.flatMap((c) => c.traits))].sort((a, b) => a.localeCompare(b, "ja"));
}

function matchesWord(card: PoolCard, word: string): boolean {
  if (card.id.toLowerCase().startsWith(word) || card.printings.some((p) => p.toLowerCase().startsWith(word))) return true;
  const texts = [card.name, card.names.en, card.names.cn, card.names.ja, card.text.en, card.text.cn, card.text.ja];
  return texts.some((t) => !!t && t.toLowerCase().includes(word));
}

function matchesText(card: PoolCard, words: readonly string[]): boolean {
  return words.every((w) => (w.startsWith("-") && w.length > 1 ? !matchesWord(card, w.slice(1)) : matchesWord(card, w)));
}

/** The deck cards the filters let through, sorted. */
export function filterPool(cards: readonly PoolCard[], f: PoolFilters, nameOf: (card: PoolCard) => string = (c) => c.name): PoolCard[] {
  const words = f.text.trim().toLowerCase().split(/\s+/).filter((w) => w !== "" && w !== "-");
  const trait = f.trait.trim();
  const out = cards.filter((card) => {
    if (!isDeckCard(card)) return false;
    if (f.class !== "any" && card.class !== f.class) return false;
    if (f.type === "evolve" ? !(card.evolved || card.advanced) : f.type !== "any" && (card.type !== f.type || card.evolved || card.advanced)) return false;
    if (f.cost !== "any") {
      const cost = Number(f.cost);
      if (card.cost === null || (cost >= 10 ? card.cost < 10 : card.cost !== cost)) return false;
    }
    if (f.set !== "any" && !card.printings.some((p) => setOf(p) === f.set)) return false;
    if (f.universe === "none" ? card.universe !== undefined : f.universe !== "any" && card.universe !== f.universe) return false;
    if (trait !== "" && !card.traits.some((t) => t.includes(trait))) return false;
    return matchesText(card, words);
  });
  if (f.sort === "cost") return out.sort((a, b) => (a.cost ?? 99) - (b.cost ?? 99) || a.id.localeCompare(b.id));
  if (f.sort === "name") return out.sort((a, b) => nameOf(a).localeCompare(nameOf(b)) || a.id.localeCompare(b.id));
  return out;
}
