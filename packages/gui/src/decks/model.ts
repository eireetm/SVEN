// Editing a deck in the deck builder (pure functions: tested in Node). A deck is a DeckFile: printing -> copies, per
// section. The builder sets no limits for now (no class, copy or size checks): the engine checks decks when a game starts
// with deck restrictions on (CR 6.1).
import type { CardDefinition } from "@sve/core";
import type { DeckFile } from "./format";

export type DeckSection = "main" | "evolve";

/** Where a card goes: evolved cards, advanced cards and evolve spells into the evolve deck (CR 6.1.1.3), the rest main. */
export function sectionOf(def: Pick<CardDefinition, "evolved" | "advanced">): DeckSection {
  return def.evolved || def.advanced ? "evolve" : "main";
}

/** Cards that can go into a deck: not leaders, not tokens (CR 9.1.2: they are created, never in a deck), not back faces. */
export function isDeckCard(def: Pick<CardDefinition, "type" | "token" | "frontFace">): boolean {
  return def.type !== "leader" && !def.token && def.frontFace === undefined;
}

/** One more copy; a new card goes after the others, a copy next to its own (the section keeps the order cards came in). */
export function addCard(deck: DeckFile, section: DeckSection, printing: string): DeckFile {
  const cards = { ...deck[section] };
  cards[printing] = (cards[printing] ?? 0) + 1;
  return { ...deck, [section]: cards };
}

/** One copy fewer (the entry goes when none is left). */
export function removeCard(deck: DeckFile, section: DeckSection, printing: string): DeckFile {
  const n = deck[section][printing] ?? 0;
  if (n === 0) return deck;
  const cards = { ...deck[section] };
  if (n === 1) delete cards[printing];
  else cards[printing] = n - 1;
  return { ...deck, [section]: cards };
}

/** Every copy of the section, in order (one entry per card shown). */
export function copiesOf(deck: DeckFile, section: DeckSection): string[] {
  return Object.entries(deck[section]).flatMap(([printing, n]) => Array<string>(n).fill(printing));
}

const TYPE_ORDER: Record<string, number> = { follower: 0, spell: 1, amulet: 2 };

export type DeckOrder = "type" | "cost";

/**
 * The deck sorted like a deck list: by type (followers, spells, amulets), then cost, then number; or by cost, then type.
 * `defOf` gives a printing's definition (unknown printings go last, in their order).
 */
export function sortDeck(deck: DeckFile, defOf: (printing: string) => Pick<CardDefinition, "id" | "type" | "cost"> | undefined, by: DeckOrder = "type"): DeckFile {
  const sorted = (cards: Record<string, number>): Record<string, number> => {
    const key = (printing: string): [number, number, string] => {
      const def = defOf(printing);
      if (!def) return [9, 99, printing];
      const type = TYPE_ORDER[def.type] ?? 3;
      const cost = def.cost ?? 99;
      return by === "type" ? [type, cost, def.id] : [cost, type, def.id];
    };
    const entries = Object.entries(cards).sort(([a], [b]) => {
      const [ta, ca, ia] = key(a);
      const [tb, cb, ib] = key(b);
      return ta - tb || ca - cb || ia.localeCompare(ib) || a.localeCompare(b);
    });
    return Object.fromEntries(entries);
  };
  return { ...deck, main: sorted(deck.main), evolve: sorted(deck.evolve) };
}

export function clearDeck(deck: DeckFile): DeckFile {
  return { ...deck, main: {}, evolve: {} };
}

/** How many copies of a definition the deck has (any printing of it, both sections). */
export function copiesOfDefinition(deck: DeckFile, printings: readonly string[]): number {
  let n = 0;
  for (const p of printings) n += (deck.main[p] ?? 0) + (deck.evolve[p] ?? 0);
  return n;
}

/** A file name for a new deck from its name: letters, digits and "-" / "_" / spaces kept, ".json" added. */
export function fileNameFor(name: string): string {
  const base = name
    .trim()
    .replace(/[^\p{L}\p{N} _-]+/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  return `${base || "deck"}.json`;
}
