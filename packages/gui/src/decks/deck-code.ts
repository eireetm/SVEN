// Deck codes: a deck as one line of text, to share in a chat or a forum and to import. "SVE1-", then the deck
// as compact text, zlib-compressed (its checksum catches a code copied wrong) and in base64url (letters, digits, "-", "_":
// nothing a chat breaks). The text has a line each for the name; the leader and the second leader (Cross Craft); the main
// deck; the evolve deck. A section lists its printings in order, "BP01-001*3" for three copies, "-002" for a printing of the
// same set as the one before. The deck file's notes stay out. The code holds printing numbers only, so a program of another
// version reads it too: cards it doesn't know are left out and named (importDeckText).
//
// Importing also reads a deck file's JSON (format "sve-deck") and a deck code of sve-server (the other simulator in the
// parent folder: {"DeckName", "Cards": {name: count}, "EvolveCards": {...}, "Skin"}), whose cards are named in Chinese:
// they are found by name (any language), a similar name when no card has that exact one (translations differ), and the
// leader by the skin's name, or else by the class most of the cards have.
import { strFromU8, strToU8, unzlibSync, zlibSync } from "fflate";
import type { Catalog } from "../app/catalog";
import type { CatalogCard } from "../engine/protocol";
import { DECK_FORMAT, DeckFormatError, parseDeckFile, type DeckFile } from "./format";
import { isDeckCard, sectionOf, type DeckSection } from "./model";

export const DECK_CODE_PREFIX = "SVE1-";

/** The most copies of a card a code may say (a deck without restrictions can have more than a legal one, CR 6.1.1.4). */
const MAX_COPIES = 99;

/** A section as text: printings in order, "*n" for n copies, "-number" for a printing of the set before it. */
function sectionText(cards: Record<string, number>): string {
  let set: string | null = null;
  const out: string[] = [];
  for (const [printing, n] of Object.entries(cards)) {
    if (n <= 0) continue;
    const dash = printing.lastIndexOf("-");
    const own = dash > 0 ? printing.slice(0, dash) : null;
    const entry = own !== null && own === set ? printing.slice(dash) : printing;
    set = own;
    out.push(n > 1 ? `${entry}*${n}` : entry);
  }
  return out.join(" ");
}

function readSection(text: string): Record<string, number> {
  const out: Record<string, number> = {};
  let set: string | null = null;
  for (const entry of text.split(" ").filter((e) => e !== "")) {
    const match = /^([^\s*]+?)(?:\*(\d+))?$/u.exec(entry);
    if (!match) throw new DeckFormatError("deckFile.codeBroken");
    const printing: string | null = match[1]!.startsWith("-") ? (set === null ? null : set + match[1]) : match[1]!;
    const n = match[2] === undefined ? 1 : Number(match[2]);
    if (printing === null || !/^[^\s*-]+-[^\s*-]+$/u.test(printing) || n < 1 || n > MAX_COPIES) throw new DeckFormatError("deckFile.codeBroken");
    set = printing.slice(0, printing.lastIndexOf("-"));
    out[printing] = (out[printing] ?? 0) + n;
  }
  return out;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/** The deck's code. */
export function deckCode(deck: DeckFile): string {
  const lines = [
    deck.name.replace(/[\r\n]+/g, " ").trim(),
    [deck.leader ?? "", deck.leader2 ?? ""].join(" ").trim(),
    sectionText(deck.main),
    sectionText(deck.evolve),
  ];
  return DECK_CODE_PREFIX + toBase64Url(zlibSync(strToU8(lines.join("\n")), { level: 9 }));
}

/** A deck from its code (spaces and line breaks a chat put in are ignored), or a DeckFormatError. */
export function readDeckCode(code: string): DeckFile {
  const compact = code.replace(/\s+/g, "");
  if (!compact.toUpperCase().startsWith(DECK_CODE_PREFIX)) throw new DeckFormatError("deckFile.notCode");
  let text: string;
  try {
    text = strFromU8(unzlibSync(fromBase64Url(compact.slice(DECK_CODE_PREFIX.length))));
  } catch {
    throw new DeckFormatError("deckFile.codeBroken");
  }
  const lines = text.split("\n");
  if (lines.length !== 4) throw new DeckFormatError("deckFile.codeBroken");
  const [leader = "", leader2 = ""] = lines[1]!.split(" ").filter((p) => p !== "");
  const deck: DeckFile = { format: DECK_FORMAT, version: 1, name: lines[0]!, main: readSection(lines[2]!), evolve: readSection(lines[3]!) };
  if (leader) deck.leader = leader;
  if (leader2) deck.leader2 = leader2;
  return deck;
}

/** What importing did that the person should know about (shown before the deck replaces the one being edited). */
export type ImportNote =
  /** A card found by a similar name (sve-server's Chinese names differ from the card data's now and then). */
  | { kind: "similar"; name: string; card: string }
  /** No card of that name: left out. */
  | { kind: "unknownName"; name: string; count: number }
  /** A printing this program doesn't know (a code of a newer version): left out. */
  | { kind: "unknownPrinting"; printing: string; count: number }
  /** The leader, found by the skin's name, or chosen as the first leader of the deck's class. */
  | { kind: "leaderBySkin"; skin: string; leader: string }
  | { kind: "leaderByClass"; className: string; leader: string }
  | { kind: "noLeader" };

export interface ImportedDeck {
  deck: DeckFile;
  notes: ImportNote[];
}

/** What a deck code or file brings: a deck, and what the person should know. Throws a DeckFormatError. */
export function importDeckText(text: string, catalog: Catalog): ImportedDeck {
  const trimmed = text.trim();
  if (trimmed.toUpperCase().startsWith(DECK_CODE_PREFIX)) return knownCards(readDeckCode(trimmed), catalog);
  if (!trimmed.startsWith("{")) throw new DeckFormatError("deckFile.notCode");
  let json: unknown;
  try {
    json = JSON.parse(trimmed);
  } catch {
    throw new DeckFormatError("deckFile.notCode");
  }
  const value = json as Record<string, unknown>;
  if (value.format === DECK_FORMAT) return knownCards(parseDeckFile(json), catalog);
  if (typeof value.Cards === "object" && value.Cards !== null) return fromSveServer(value, catalog);
  throw new DeckFormatError("deckFile.notCode");
}

/** Leave out the printings this program doesn't know, naming them. */
function knownCards(deck: DeckFile, catalog: Catalog): ImportedDeck {
  const notes: ImportNote[] = [];
  const keep = (cards: Record<string, number>): Record<string, number> => {
    const out: Record<string, number> = {};
    for (const [printing, n] of Object.entries(cards)) {
      if (catalog.printing(printing)) out[printing] = n;
      else notes.push({ kind: "unknownPrinting", printing, count: n });
    }
    return out;
  };
  const out: DeckFile = { ...deck, main: keep(deck.main), evolve: keep(deck.evolve) };
  for (const key of ["leader", "leader2"] as const) {
    const printing = out[key];
    if (printing && catalog.printing(printing)?.type !== "leader") {
      notes.push({ kind: "unknownPrinting", printing, count: 1 });
      delete out[key];
    }
  }
  return { deck: out, notes };
}

/** A name as compared: NFKC, lower case, without spaces and the marks translations write differently (·・, quotes …). */
export function nameKey(name: string): string {
  return name
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s·•‧・･.\-‐-―−「」『』“”"'‘’!！?？,，、:：;；()（）[\]【】<>《》~〜]/gu, "");
}

/** The edit distance of two names (letters inserted, removed or changed). */
function distance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) current.push(Math.min(previous[j]! + 1, current[j - 1]! + 1, previous[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1)));
    previous = current;
  }
  return previous[b.length]!;
}

interface Named {
  card: CatalogCard;
  printing: string;
}

/** Every name of the cards (all languages, alternate names of printings) -> the cards, per catalog. */
const indexes = new WeakMap<Catalog, Map<string, Named[]>>();

function nameIndex(catalog: Catalog): Map<string, Named[]> {
  let index = indexes.get(catalog);
  if (index) return index;
  index = new Map();
  const add = (name: string | null | undefined, named: Named) => {
    if (!name) return;
    const key = nameKey(name);
    if (key === "") return;
    const list = index!.get(key) ?? [];
    if (!list.some((n) => n.card === named.card && n.printing === named.printing)) list.push(named);
    index!.set(key, list);
  };
  for (const card of catalog.cards) {
    if (card.type !== "leader" && !isDeckCard(card)) continue;
    const base = { card, printing: card.printings[0] ?? card.id };
    for (const name of [card.name, card.names.en, card.names.cn, card.names.ja]) add(name, base);
    for (const [printing, names] of Object.entries(card.alternateNames ?? {})) for (const name of [names.en, names.cn, names.ja]) add(name, { card, printing });
  }
  indexes.set(catalog, index);
  return index;
}

/**
 * The card a name means, among those `fits` allows: one with that name, else the one with the most similar name when a
 * single one is that close (a quarter of the letters may differ, for names of four letters or more).
 */
function findByName(name: string, catalog: Catalog, fits: (card: CatalogCard) => boolean): { found: Named; similar: boolean } | null {
  const index = nameIndex(catalog);
  const key = nameKey(name);
  const exact = (index.get(key) ?? []).filter((n) => fits(n.card));
  if (exact.length > 0) return { found: exact[0]!, similar: false };
  const most = Math.floor(key.length / 4);
  if (most === 0) return null;
  let best: Named[] = [];
  let bestDistance = most + 1;
  for (const [other, named] of index) {
    if (Math.abs(other.length - key.length) > most) continue;
    const candidates = named.filter((n) => fits(n.card));
    if (candidates.length === 0) continue;
    const d = distance(key, other);
    if (d < bestDistance) {
      bestDistance = d;
      best = [candidates[0]!];
    } else if (d === bestDistance && !best.some((b) => b.card === candidates[0]!.card)) best.push(candidates[0]!);
  }
  return best.length === 1 ? { found: best[0]!, similar: true } : null;
}

/** A deck code of sve-server: cards and the leader by name (module comment). */
function fromSveServer(value: Record<string, unknown>, catalog: Catalog): ImportedDeck {
  const notes: ImportNote[] = [];
  const deck: DeckFile = { format: DECK_FORMAT, version: 1, name: "", main: {}, evolve: {} };
  const name = [value.DeckName, value.Craft].find((n): n is string => typeof n === "string" && n.trim() !== "");
  if (name) deck.name = name.trim();
  const classes = new Map<string, number>();
  const read = (cards: unknown, section: DeckSection) => {
    if (typeof cards !== "object" || cards === null) return;
    for (const [cardName, count] of Object.entries(cards as Record<string, unknown>)) {
      // "$type": a note of the .NET serializer, not a card.
      if (cardName.startsWith("$") || typeof count !== "number" || !Number.isInteger(count) || count < 1) continue;
      const hit = findByName(cardName, catalog, (card) => card.type !== "leader" && isDeckCard(card) && sectionOf(card) === section);
      if (!hit) {
        notes.push({ kind: "unknownName", name: cardName, count });
        continue;
      }
      if (hit.similar) notes.push({ kind: "similar", name: cardName, card: hit.found.card.id });
      deck[section][hit.found.printing] = (deck[section][hit.found.printing] ?? 0) + count;
      if (hit.found.card.class !== "Neutral") classes.set(hit.found.card.class, (classes.get(hit.found.card.class) ?? 0) + count);
    }
  };
  read(value.Cards, "main");
  read(value.EvolveCards, "evolve");
  // The deck's class: the one most of its cards have.
  const deckClass = [...classes].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const skin = typeof value.Skin === "string" && value.Skin.trim() !== "" ? value.Skin.trim() : null;
  const bySkin = skin ? findByName(skin, catalog, (card) => card.type === "leader" && (deckClass === null || card.class === deckClass)) : null;
  if (skin && bySkin) {
    deck.leader = bySkin.found.printing;
    notes.push({ kind: "leaderBySkin", skin, leader: bySkin.found.card.id });
  } else if (deckClass) {
    const leader = catalog.cards.filter((card) => card.type === "leader" && card.class === deckClass && !card.universe).sort((a, b) => a.id.localeCompare(b.id))[0];
    if (leader) {
      deck.leader = leader.printings[0] ?? leader.id;
      notes.push({ kind: "leaderByClass", className: deckClass, leader: leader.id });
    } else notes.push({ kind: "noLeader" });
  } else notes.push({ kind: "noLeader" });
  return { deck, notes };
}
