// The online state the screens read (docs/online.md): the connection (looking, connected, closed), the chat, the
// preparation of a game and the game in progress. The connections themselves are made in net/online.ts, which loads with the
// online screen; this module has no connection code, so the game screen can show the state without it.
import { useSyncExternalStore } from "react";
import type { FormatProblem } from "../formats/formats";
import type { MessageKey } from "../i18n";
import type { PeerLink, Route, Via } from "./link";
import { CHAT_MAX, type Hello, type ReadyDeck, type Rules } from "./messages";

export type OnlinePhase =
  | { kind: "idle" }
  /** Waiting in room `code` for a guest. */
  | { kind: "hosting"; code: string }
  /** Looking for the host of room `code`. */
  | { kind: "joining"; code: string }
  /** Codes by hand, the host's side: its connection code (null: being made), then waiting for the reply code. */
  | { kind: "manualHost"; offer: string | null; accepted: boolean }
  /** Codes by hand, the guest's side: its reply code (null: being made), then waiting for the connection. */
  | { kind: "manualGuest"; reply: string | null }
  | { kind: "connected"; role: "host" | "guest"; via: Via; route: Route; rtt: number | null; peer: Hello | null }
  /** The connection ended: the other player left, it was lost, or the room had a guest already. */
  | { kind: "closed"; reason: "left" | "lost" | "full" };

export interface ChatLine {
  from: "me" | "peer";
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

/** The game played over the connection: its id (the seed), this program's seat, the other player's deck. */
export interface OnlineGame {
  id: string;
  seat: 0 | 1;
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
  room: { code: string; role: "host" | "guest" } | null;
}

export const NO_PREP: Prep = { rules: null, mine: null, theirs: null, theirsProblems: null, starting: false };

let state: OnlineState = { phase: { kind: "idle" }, since: Date.now(), chat: [], error: null, prep: NO_PREP, game: null, room: null };
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

// The connection (net/online.ts sets it).
let link: PeerLink | null = null;

export function currentLink(): PeerLink | null {
  return link;
}

export function setLink(next: PeerLink | null): void {
  link = next;
}

export function sendChat(text: string): void {
  const line = text.trim().slice(0, CHAT_MAX);
  if (!link || line === "") return;
  link.send({ t: "chat", text: line });
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
