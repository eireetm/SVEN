// Deck files (decks/*.json) and the text form the deck editor uses. Pure functions: used by the app, the scripts and the
// tests. Whether a deck is legal is the engine's question (Engine.validateDeck, CR 6.1), not this module's.
import type { DeckList } from "@sve/core";
import { en } from "../i18n/en";

export const DECK_FORMAT = "sve-deck";

/** A deck file: how many of each printing (CR 6.1.1: a leader, the main deck and the evolve deck). */
export interface DeckFile {
  format: typeof DECK_FORMAT;
  version: 1;
  name: string;
  /** A leader printing. Optional: without deck restrictions a placeholder leader is used (CR 6.1.1.1). */
  leader?: string;
  /** Cross Craft: the second leader printing, of another class (CR Appendix B-2 6.1.1.1). Other formats ignore it. */
  leader2?: string;
  /** Printing id -> number of copies, in the order written. */
  main: Record<string, number>;
  evolve: Record<string, number>;
  notes?: string;
}

/** What is wrong with a deck file: a message of the interface (English here; errorText says it in the person's language). */
export type DeckFileKey = Extract<keyof typeof en, `deckFile.${string}`>;

export class DeckFormatError extends Error {
  constructor(
    readonly key: DeckFileKey,
    readonly params: Record<string, string> = {},
  ) {
    super(en[key].replace(/\{(\w+)\}/g, (all, name: string) => params[name] ?? all));
  }
}

export function emptyDeck(name: string): DeckFile {
  return { format: DECK_FORMAT, version: 1, name, main: {}, evolve: {} };
}

function counts(value: unknown, key: string): Record<string, number> {
  if (value === undefined) return {};
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new DeckFormatError("deckFile.counts", { section: key });
  const out: Record<string, number> = {};
  for (const [card, n] of Object.entries(value as Record<string, unknown>)) {
    if (typeof n !== "number" || !Number.isInteger(n) || n < 0) throw new DeckFormatError("deckFile.count", { section: key, card });
    if (n > 0) out[card] = n;
  }
  return out;
}

/** Check a deck file's shape (a parsed JSON value). */
export function parseDeckFile(value: unknown): DeckFile {
  if (typeof value !== "object" || value === null) throw new DeckFormatError("deckFile.notObject");
  const v = value as Record<string, unknown>;
  if (v.format !== DECK_FORMAT) throw new DeckFormatError("deckFile.format");
  if (v.version !== 1) throw new DeckFormatError("deckFile.version", { version: String(v.version) });
  if (typeof v.name !== "string") throw new DeckFormatError("deckFile.name");
  if (v.leader !== undefined && typeof v.leader !== "string") throw new DeckFormatError("deckFile.leader");
  if (v.leader2 !== undefined && typeof v.leader2 !== "string") throw new DeckFormatError("deckFile.leader");
  const deck: DeckFile = { format: DECK_FORMAT, version: 1, name: v.name, main: counts(v.main, "main"), evolve: counts(v.evolve, "evolve") };
  if (typeof v.leader === "string" && v.leader !== "") deck.leader = v.leader;
  if (typeof v.leader2 === "string" && v.leader2 !== "") deck.leader2 = v.leader2;
  if (typeof v.notes === "string" && v.notes !== "") deck.notes = v.notes;
  return deck;
}

/** The engine's deck list: every copy listed, with the deck's leader or `leader` (Cross Craft: the one the engine plays with). */
export function toDeckList(deck: DeckFile, leader: string | undefined = deck.leader): DeckList {
  const expand = (c: Record<string, number>) => Object.entries(c).flatMap(([card, n]) => Array<string>(n).fill(card));
  return { ...(leader ? { leader } : {}), main: expand(deck.main), evolve: expand(deck.evolve) };
}

export const cardCount = (c: Record<string, number>): number => Object.values(c).reduce((a, b) => a + b, 0);

/**
 * The text form:
 *
 *   name: My deck
 *   leader: SD01-LD01
 *   leader2: SD02-LD01    (Cross Craft)
 *   [main]
 *   3 SD01-011  ; Goblin
 *   [evolve]
 *   2 SD01-004
 *   ; A line that is only a comment is part of the deck's notes.
 *
 * Also accepted: "3x SD01-011", "SD01-011 x3", "SD01-011" (1 copy). A comment after a card is ignored (the editor writes
 * the card's name there, `nameOf`); blank lines are ignored.
 */
export function deckToText(deck: DeckFile, nameOf?: (printing: string) => string | undefined): string {
  const named = (line: string, card: string) => {
    const name = nameOf?.(card);
    return name ? `${line}  ; ${name}` : line;
  };
  const lines = [`name: ${deck.name}`];
  if (deck.leader) lines.push(named(`leader: ${deck.leader}`, deck.leader));
  if (deck.leader2) lines.push(named(`leader2: ${deck.leader2}`, deck.leader2));
  lines.push("", "[main]", ...Object.entries(deck.main).map(([c, n]) => named(`${n} ${c}`, c)));
  lines.push("", "[evolve]", ...Object.entries(deck.evolve).map(([c, n]) => named(`${n} ${c}`, c)));
  if (deck.notes) lines.push("", ...deck.notes.split("\n").map((l) => `; ${l}`));
  return lines.join("\n") + "\n";
}

export interface ParsedText {
  deck: DeckFile;
  /** The lines that aren't "COUNT CARD" (numbered from 1). */
  errors: { line: number; text: string }[];
}

export function deckFromText(text: string, fallbackName = "Untitled"): ParsedText {
  const deck = emptyDeck(fallbackName);
  const errors: ParsedText["errors"] = [];
  const notes: string[] = [];
  let section: "main" | "evolve" = "main";
  text.split(/\r?\n/).forEach((raw, i) => {
    if (raw.trimStart().startsWith(";")) {
      notes.push(raw.trimStart().replace(/^;\s?/, ""));
      return;
    }
    const line = raw.replace(/;.*$/, "").trim();
    if (line === "") return;
    const header = /^\[(main|evolve)\]$/i.exec(line);
    if (header) {
      section = header[1]!.toLowerCase() as "main" | "evolve";
      return;
    }
    const field = /^(name|leader2?)\s*:\s*(.*)$/i.exec(line);
    if (field) {
      const key = field[1]!.toLowerCase() as "name" | "leader" | "leader2";
      const value = field[2]!.trim();
      if (key === "name") deck.name = value;
      else if (value !== "") deck[key] = value;
      else delete deck[key];
      return;
    }
    const entry = /^(?:(\d+)\s*x?\s+(\S+)|(\S+)\s+x\s*(\d+)|(\S+))$/i.exec(line);
    if (!entry) {
      errors.push({ line: i + 1, text: raw.trim() });
      return;
    }
    const card = entry[2] ?? entry[3] ?? entry[5]!;
    const n = Number(entry[1] ?? entry[4] ?? 1);
    if (n <= 0) return;
    deck[section][card] = (deck[section][card] ?? 0) + n;
  });
  if (notes.length > 0) deck.notes = notes.join("\n");
  return { deck, errors };
}
