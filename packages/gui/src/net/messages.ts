// What two connected programs say to each other. Plain JSON; anything else that arrives is ignored (the
// other side may run another version, or not be this program at all).
import type { DeckList, Input } from "@sve/core";
import type { FormatId, GameOptions, RecordedInput, TurnOrder } from "../engine/protocol";

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

/** What a program joining a room asks for: the other player's seat, or a spectator's (watching only). */
export type JoinAs = "player" | "watch";

/** Spectators a room takes besides its two players. */
export const SPECTATOR_SEATS = 2;

/**
 * A game, for a spectator's program to play along: what its engine needs to start it (both seats are
 * the players' programs there), and how many inputs the "backlog" messages bring (the game's inputs until the spectator came).
 */
export interface WatchedGame {
  /** The game's id (its seed). */
  id: string;
  decks: [DeckList, DeckList];
  deckNames: [string, string];
  deckRestrictions: boolean;
  format: FormatId;
  restrictionList: string | null;
  secondLeaders: [string | null, string | null];
  turnOrder: TurnOrder;
  backlog: number;
}

/** The inputs a "backlog" message brings at most. */
export const BACKLOG_PIECE = 400;

export type NetMessage =
  | Hello
  /** A program that joined a room: the seat it wants (said to each program it meets there; only the host answers). */
  | { t: "join"; as: JoinAs }
  /** The host took this program in (the player's seat, or a spectator's): this is the connection. */
  | { t: "select" }
  /** The host has no seat left of the kind asked for. */
  | { t: "full" }
  /** A chat line; to a spectator, the host also says whose (the seat of the player who wrote it). */
  | { t: "chat"; text: string; seat?: 0 | 1 }
  /** The host: how many spectators are watching (to the players and the spectators). */
  | { t: "watchers"; n: number }
  /** The host, to a spectator: the game being played now (null: none yet), its inputs so far following as "backlog". */
  | { t: "watch"; game: WatchedGame | null }
  /** The host, to a spectator: inputs `start`.. of the game being watched (with who gave each: a seat, or the engines). */
  | { t: "backlog"; start: number; inputs: RecordedInput[] }
  | { t: "ping"; n: number }
  | { t: "pong"; n: number }
  /** Leaving on purpose (not a lost connection). */
  | { t: "bye" }
  /** The host: the game's rules (again whenever they change). */
  | { t: "rules"; rules: Rules }
  /** A player's deck, locked (null: not ready any more). */
  | { t: "ready"; deck: ReadyDeck | null }
  /** The seed, in three steps: the host's secret's hash, the guest's random part, the host's secret. */
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

const isSeat = (v: unknown): v is 0 | 1 => v === 0 || v === 1;

function recordedInput(v: unknown): RecordedInput | null {
  if (typeof v !== "object" || v === null) return null;
  const r = v as Record<string, unknown>;
  const answer = input(r.input);
  return answer && (r.by === null || isSeat(r.by)) ? { input: answer, by: r.by as 0 | 1 | null } : null;
}

function watchedGame(v: unknown): WatchedGame | null {
  if (typeof v !== "object" || v === null) return null;
  const g = v as Record<string, unknown>;
  const decks = Array.isArray(g.decks) && g.decks.length === 2 ? g.decks.map(deckList) : [];
  const names = g.deckNames;
  const leaders = g.secondLeaders;
  if (!isString(g.id, 128) || !decks[0] || !decks[1] || !isIndex(g.backlog) || typeof g.deckRestrictions !== "boolean") return null;
  if (!Array.isArray(names) || names.length !== 2 || !names.every((n) => isString(n, 120))) return null;
  if (!Array.isArray(leaders) || leaders.length !== 2 || !leaders.every((l) => l === null || isString(l, 32))) return null;
  if (!FORMATS.includes(g.format as FormatId) || !TURN_ORDERS.includes(g.turnOrder as TurnOrder) || !(g.restrictionList === null || isString(g.restrictionList))) return null;
  return {
    id: g.id,
    decks: [decks[0], decks[1]],
    deckNames: [names[0] as string, names[1] as string],
    deckRestrictions: g.deckRestrictions,
    format: g.format as FormatId,
    restrictionList: g.restrictionList as string | null,
    secondLeaders: [leaders[0] as string | null, leaders[1] as string | null],
    turnOrder: g.turnOrder as TurnOrder,
    backlog: g.backlog,
  };
}

/**
 * A watched game's options for a spectator's engine: both seats are the players' programs ("remote"), with the pacing the
 * players' games have (net/online.ts onlineOptions), so the engines ask the same decisions.
 */
export function watchedOptions(game: WatchedGame): GameOptions {
  return {
    seed: game.id,
    decks: game.decks,
    deckNames: game.deckNames,
    controllers: ["remote", "remote"],
    deckRestrictions: game.deckRestrictions,
    format: game.format,
    restrictionList: game.restrictionList,
    secondLeaders: game.secondLeaders,
    showEveryMainPhase: true,
    askEveryQuickWindow: true,
    manualActions: false,
    turnOrder: game.turnOrder,
  };
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
    case "join":
      return m.as === "player" || m.as === "watch" ? { t: "join", as: m.as } : null;
    case "chat":
      if (typeof m.text !== "string" || !(m.seat === undefined || isSeat(m.seat))) return null;
      return { t: "chat", text: m.text.slice(0, CHAT_MAX), ...(m.seat !== undefined ? { seat: m.seat } : {}) };
    case "watchers":
      return isIndex(m.n) && m.n <= SPECTATOR_SEATS ? { t: "watchers", n: m.n } : null;
    case "watch": {
      if (m.game === null) return { t: "watch", game: null };
      const game = watchedGame(m.game);
      return game ? { t: "watch", game } : null;
    }
    case "backlog": {
      if (!isIndex(m.start) || !Array.isArray(m.inputs) || m.inputs.length > BACKLOG_PIECE) return null;
      const inputs = m.inputs.map(recordedInput);
      return inputs.every((r) => r !== null) ? { t: "backlog", start: m.start, inputs: inputs as RecordedInput[] } : null;
    }
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
