// The online state the screens read (docs/online.md): the connection (looking, connected, closed), the chat, the
// preparation of a game, the game in progress (played, or watched by a spectator) and how many spectators there are. The
// connections themselves are made in net/online.ts, which loads with the online screen; this module has no connection
// code, so the game screen can show the state without it.
import { useSyncExternalStore } from "react";
import type { FormatProblem } from "../formats/formats";
import type { MessageKey } from "../i18n";
import type { PeerLink, Route, Via } from "./link";
import { CHAT_MAX, type Hello, type JoinAs, type ReadyDeck, type Rules } from "./messages";

export type OnlinePhase =
  | { kind: "idle" }
  /** Waiting in room `code` for a guest. */
  | { kind: "hosting"; code: string }
  /** Looking for the host of room `code`, to play (the other player's seat) or to watch (a spectator's). */
  | { kind: "joining"; code: string; as: JoinAs }
  /** Codes by hand, the host's side: its connection code (null: being made), then waiting for the reply code. */
  | { kind: "manualHost"; offer: string | null; accepted: boolean }
  /** Codes by hand, the guest's side: its reply code (null: being made), then waiting for the connection. */
  | { kind: "manualGuest"; reply: string | null }
  | { kind: "connected"; role: OnlineRole; via: Via; route: Route; rtt: number | null; peer: Hello | null }
  /** The connection ended: the other side left, it was lost, or the room had no seat left (a player's, or a spectator's). */
  | { kind: "closed"; reason: "left" | "lost" | "full" | "watchFull" };

/** The host (player 1), the other player (player 2), or a spectator (connected to the host, watching only). */
export type OnlineRole = "host" | "guest" | "spectator";

/** Who wrote a chat line: this program's person, the other player, or (seen by a spectator) player 1 or 2. */
export interface ChatLine {
  from: "me" | "peer" | 0 | 1;
  text: string;
}

/**
 * Preparing a game: the host's rules (the guest's copy once received), each player's locked deck (null: not ready), what
 * this program finds wrong with the other's deck under the rules (null: not checked yet), and whether the seed is being
 * made (both ready: nobody can take it back then).
 */
export interface Prep {
  rules: Rules | null;
  mine: ReadyDeck | null;
  theirs: ReadyDeck | null;
  theirsProblems: FormatProblem[] | null;
  starting: boolean;
}

/** The game played over the connection: its id (the seed), this program's seat (null: watching), the other player's deck. */
export interface OnlineGame {
  id: string;
  seat: 0 | 1 | null;
  opponent: string;
}

export interface OnlineState {
  phase: OnlinePhase;
  /** When the phase began (ms since 1970), for "still looking" hints. */
  since: number;
  chat: ChatLine[];
  /** What went wrong last (shown until the next action). */
  error: MessageKey | null;
  prep: Prep;
  game: OnlineGame | null;
  /** The room of the last connection, to connect again the same way after losing it (null: codes by hand). */
  room: { code: string; role: OnlineRole } | null;
  /** Spectators watching the room's games (the host counts them and tells the others). */
  watchers: number;
}

export const NO_PREP: Prep = { rules: null, mine: null, theirs: null, theirsProblems: null, starting: false };

let state: OnlineState = { phase: { kind: "idle" }, since: Date.now(), chat: [], error: null, prep: NO_PREP, game: null, room: null, watchers: 0 };
const listeners = new Set<() => void>();

export function setOnline(change: Partial<OnlineState>): void {
  state = { ...state, ...change, ...(change.phase ? { since: Date.now() } : {}) };
  for (const listener of listeners) listener();
}

export function getOnline(): OnlineState {
  return state;
}

export function useOnline(): OnlineState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
  );
}

// The connection (net/online.ts sets it): to the other player, or a spectator's to the host.
let link: PeerLink | null = null;
/** The host: its own chat lines go to the spectators too (net/online.ts sets it). */
let chatRelay: ((text: string) => void) | null = null;

export function setChatRelay(fn: ((text: string) => void) | null): void {
  chatRelay = fn;
}

/** Whether this program may write in the chat: a player connected (a spectator only reads it). */
export function canChat(s: OnlineState = state): boolean {
  return s.phase.kind === "connected" && s.phase.role !== "spectator";
}

export function currentLink(): PeerLink | null {
  return link;
}

export function setLink(next: PeerLink | null): void {
  link = next;
}

export function sendChat(text: string): void {
  const line = text.trim().slice(0, CHAT_MAX);
  if (!link || line === "" || !canChat()) return;
  link.send({ t: "chat", text: line });
  chatRelay?.(line);
  setOnline({ chat: [...state.chat, { from: "me" as const, text: line }].slice(-200) });
}

/** A game over the connection has begun: the online screen shows it. */
const starts = new Set<() => void>();

export function onGameStart(fn: () => void): () => void {
  starts.add(fn);
  return () => {
    starts.delete(fn);
  };
}

export function gameStarted(): void {
  for (const fn of starts) fn();
}
