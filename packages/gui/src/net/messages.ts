// What two connected programs say to each other (docs/online.md). Plain JSON; anything else that arrives is ignored (the
// other side may run another version, or not be this program at all).
import type { DeckList, Input } from "@sve/core";
import type { FormatId, TurnOrder } from "../engine/protocol";

/**
 * Who a program is: the protocol, a fingerprint of its card data and one of its engine (the rules code): two programs play
 * a game only when all three are the same.
 */
export interface Hello {
  t: "hello";
  version: string;
  cards: string;
  engine: string;
}

/** The game's rules, set by the host. */
export interface Rules {
  format: FormatId;
  /** The restriction list (a file of restrictions/), or none. */
  list: string | null;
  turnOrder: TurnOrder;
}

/** A player's deck, locked for the game ("ready"). */
export interface ReadyDeck {
  name: string;
  deck: DeckList;
  /** Cross Craft: the second leader's printing (shown beside the leader). */
  leader2: string | null;
}

export type NetMessage =
  | Hello
  /** The host chose this connection among the relays' (the others close). */
  | { t: "select" }
  /** The host has a guest already. */
  | { t: "full" }
  | { t: "chat"; text: string }
  | { t: "ping"; n: number }
  | { t: "pong"; n: number }
  /** Leaving on purpose (not a lost connection). */
  | { t: "bye" }
  /** The host: the game's rules (again whenever they change). */
  | { t: "rules"; rules: Rules }
  /** A player's deck, locked (null: not ready any more). */
  | { t: "ready"; deck: ReadyDeck | null }
  /** The seed, in three steps: the host's secret's hash, the guest's random part, the host's secret (docs/online.md). */
  | { t: "commit"; hash: string }
  | { t: "nonce"; value: string }
  | { t: "start"; secret: string }
  /** An answer of the sender's seat: the game's `index`th input, and the sender's state before it (game-host.ts stateHash). */
  | { t: "input"; index: number; input: Input; hash: string }
  /** After reconnecting: the game in progress, and how many of its inputs the sender has played. */
  | { t: "resume"; game: string; have: number };

/** The longest chat line. */
export const CHAT_MAX = 500;

const FORMATS: readonly FormatId[] = ["standard", "crossCraft", "unlimited"];
const TURN_ORDERS: readonly TurnOrder[] = ["choose", "random", "player1", "player2"];

const isString = (v: unknown, max = 64): v is string => typeof v === "string" && v.length <= max;
const isIndex = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0 && v < 1_000_000;
const strings = (v: unknown, max: number): v is string[] => Array.isArray(v) && v.length <= max && v.every((x) => isString(x, 32));

function deckList(v: unknown): DeckList | null {
  if (typeof v !== "object" || v === null) return null;
  const d = v as Record<string, unknown>;
  if (!strings(d.main, 200) || !strings(d.evolve, 60) || (d.leader !== undefined && !isString(d.leader, 32))) return null;
  return { ...(d.leader !== undefined ? { leader: d.leader as string } : {}), main: d.main, evolve: d.evolve };
}

function readyDeck(v: unknown): ReadyDeck | null {
  if (typeof v !== "object" || v === null) return null;
  const r = v as Record<string, unknown>;
  const deck = deckList(r.deck);
  if (!deck || !isString(r.name, 120) || !(r.leader2 === null || isString(r.leader2, 32))) return null;
  return { name: r.name, deck, leader2: r.leader2 };
}

/** An engine input as it came: its shape only (the engine checks it before it plays it, and the state hash after). */
function input(v: unknown): Input | null {
  if (typeof v !== "object" || v === null || typeof (v as { type?: unknown }).type !== "string") return null;
  return JSON.stringify(v).length <= 4096 ? (v as Input) : null;
}

/** A message received, if it is one (checked field by field). */
export function parseMessage(value: unknown): NetMessage | null {
  if (typeof value !== "object" || value === null) return null;
  const m = value as Record<string, unknown>;
  switch (m.t) {
    case "hello":
      return isString(m.version) && isString(m.cards) && isString(m.engine) ? { t: "hello", version: m.version, cards: m.cards, engine: m.engine } : null;
    case "select":
    case "full":
    case "bye":
      return { t: m.t };
    case "chat":
      return typeof m.text === "string" ? { t: "chat", text: m.text.slice(0, CHAT_MAX) } : null;
    case "ping":
    case "pong":
      return typeof m.n === "number" && Number.isFinite(m.n) ? { t: m.t, n: m.n } : null;
    case "rules": {
      const r = m.rules as Record<string, unknown> | null;
      if (typeof r !== "object" || r === null) return null;
      if (!FORMATS.includes(r.format as FormatId) || !TURN_ORDERS.includes(r.turnOrder as TurnOrder) || !(r.list === null || isString(r.list))) return null;
      return { t: "rules", rules: { format: r.format as FormatId, list: r.list as string | null, turnOrder: r.turnOrder as TurnOrder } };
    }
    case "ready": {
      if (m.deck === null) return { t: "ready", deck: null };
      const deck = readyDeck(m.deck);
      return deck ? { t: "ready", deck } : null;
    }
    case "commit":
      return isString(m.hash, 128) ? { t: "commit", hash: m.hash } : null;
    case "nonce":
      return isString(m.value, 128) ? { t: "nonce", value: m.value } : null;
    case "start":
      return isString(m.secret, 128) ? { t: "start", secret: m.secret } : null;
    case "input": {
      const answer = input(m.input);
      return answer && isIndex(m.index) && isString(m.hash) ? { t: "input", index: m.index, input: answer, hash: m.hash } : null;
    }
    case "resume":
      return isString(m.game, 128) && isIndex(m.have) ? { t: "resume", game: m.game, have: m.have } : null;
    default:
      return null;
  }
}
