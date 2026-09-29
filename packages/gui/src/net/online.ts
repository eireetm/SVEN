// The online connection (docs/online.md): looking for the other player (a room code on the public networks, or codes passed
// by hand), then connected — the round-trip time, whether the connection is direct, the other program's version — and a
// chat. One connection at a time. The online screen shows this; the game will use the same link (the next step).
import { useSyncExternalStore } from "react";
import type { Catalog } from "../app/catalog";
import { getSettings } from "../app/settings";
import type { MessageKey } from "../i18n";
import { newRoomCode } from "./codes";
import type { PeerLink, Route, Via } from "./link";
import { answerConnection, BadCodeError, offerConnection, type ManualAttempt } from "./manual";
import { CHAT_MAX, type Hello, type NetMessage } from "./messages";
import { meet, type Meeting } from "./rooms";
import type { TurnServer } from "./relays";

/** The protocol these messages follow (a program with another one can't play with this one). */
export const PROTOCOL = "online-1";

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

export interface OnlineState {
  phase: OnlinePhase;
  /** When the phase began (ms since 1970), for "still looking" hints. */
  since: number;
  chat: ChatLine[];
  /** What went wrong last (shown until the next action). */
  error: MessageKey | null;
}

let state: OnlineState = { phase: { kind: "idle" }, since: Date.now(), chat: [], error: null };
const listeners = new Set<() => void>();

function set(change: Partial<OnlineState>): void {
  state = { ...state, ...change, ...(change.phase ? { since: Date.now() } : {}) };
  for (const listener of listeners) listener();
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

export function getOnline(): OnlineState {
  return state;
}

// What this program tells the other one: the protocol and a fingerprint of its card data (set when the catalog is known).
let hello: Hello = { t: "hello", version: PROTOCOL, cards: "" };

/** A short fingerprint of the card pool (definitions and how complete their scripts are): two programs must play the same cards. */
export async function cardsFingerprint(catalog: Catalog): Promise<string> {
  const text = JSON.stringify(catalog.cards.map((card) => [card.id, card.status]));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest).slice(0, 8)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function identify(catalog: Catalog): Promise<void> {
  hello = { t: "hello", version: PROTOCOL, cards: await cardsFingerprint(catalog) };
}

// The attempt under way, and the connection.
let meeting: Meeting | null = null;
let attempt: (ManualAttempt & { accept?: (reply: string) => Promise<void> }) | null = null;
let link: PeerLink | null = null;
let pinger: number | null = null;
let pingSent = new Map<number, number>();
let pingSeq = 0;

const turn = (): TurnServer | null => {
  const t = getSettings().turn;
  return t.urls.trim() !== "" ? t : null;
};

function stopLooking(): void {
  meeting?.cancel();
  meeting = null;
  attempt?.cancel();
  attempt = null;
}

function disconnect(): void {
  if (pinger !== null) window.clearInterval(pinger);
  pinger = null;
  pingSent = new Map();
  if (link) {
    link.onClose = null;
    link.onMessage = null;
    link.close();
  }
  link = null;
}

/** Connected: say who this program is, keep measuring the round trip, answer the other side. */
function connected(role: "host" | "guest", peer: PeerLink): void {
  // The attempt that connected now belongs to the link (the meeting has left its other networks already): not cancelled.
  meeting = null;
  attempt = null;
  disconnect();
  link = peer;
  set({ phase: { kind: "connected", role, via: peer.via, route: "unknown", rtt: null, peer: null }, chat: [], error: null });
  peer.onMessage = (message) => receive(message);
  peer.onClose = () => {
    disconnect();
    set({ phase: { kind: "closed", reason: "lost" } });
  };
  peer.send(hello);
  const ping = () => {
    const n = ++pingSeq;
    pingSent.set(n, performance.now());
    peer.send({ t: "ping", n });
  };
  ping();
  pinger = window.setInterval(ping, 3000);
  // The route is known once the connection has settled.
  for (const ms of [800, 4000]) {
    window.setTimeout(() => {
      if (link !== peer) return;
      void peer.route().then((route) => {
        if (link === peer && state.phase.kind === "connected") set({ phase: { ...state.phase, route } });
      });
    }, ms);
  }
}

function receive(message: NetMessage): void {
  const phase = state.phase;
  if (phase.kind !== "connected") return;
  switch (message.t) {
    case "hello":
      set({ phase: { ...phase, peer: message } });
      break;
    case "chat":
      set({ chat: [...state.chat, { from: "peer" as const, text: message.text }].slice(-200) });
      break;
    case "ping":
      link?.send({ t: "pong", n: message.n });
      break;
    case "pong": {
      const sent = pingSent.get(message.n);
      pingSent.delete(message.n);
      if (sent !== undefined) set({ phase: { ...phase, rtt: Math.round(performance.now() - sent) } });
      break;
    }
    case "bye":
      disconnect();
      set({ phase: { kind: "closed", reason: "left" } });
      break;
    default:
      break;
  }
}

/** Make a room: its code, to pass to the other player; wait for them. */
export function hostRoom(): void {
  stopLooking();
  disconnect();
  const code = newRoomCode();
  set({ phase: { kind: "hosting", code }, error: null });
  meeting = meet(code, "host", turn(), { onLink: (peer) => connected("host", peer), onFull: () => undefined });
}

/** Join the room of this code (already normalized: codes.ts normalizeRoomCode). */
export function joinRoom(code: string): void {
  stopLooking();
  disconnect();
  set({ phase: { kind: "joining", code }, error: null });
  meeting = meet(code, "guest", turn(), {
    onLink: (peer) => connected("guest", peer),
    onFull: () => {
      stopLooking();
      set({ phase: { kind: "closed", reason: "full" } });
    },
  });
}

/** Codes by hand, the host: make the connection code. */
export async function hostManually(): Promise<void> {
  stopLooking();
  disconnect();
  set({ phase: { kind: "manualHost", offer: null, accepted: false }, error: null });
  try {
    const made = await offerConnection(turn());
    if (state.phase.kind !== "manualHost") return made.cancel();
    attempt = made;
    set({ phase: { kind: "manualHost", offer: made.code, accepted: false } });
    void made.link.then((peer) => {
      if (attempt === made) connected("host", peer);
    });
  } catch {
    set({ phase: { kind: "idle" }, error: "online.failed" });
  }
}

/** Codes by hand, the host: the guest's reply code completes the connection. */
export async function acceptReply(reply: string): Promise<void> {
  const phase = state.phase;
  if (phase.kind !== "manualHost" || !attempt?.accept) return;
  try {
    await attempt.accept(reply);
    set({ phase: { ...phase, accepted: true }, error: null });
  } catch (err) {
    set({ error: err instanceof BadCodeError ? "online.badReply" : "online.failed" });
  }
}

/** Codes by hand, the guest: from the host's connection code, the reply code. */
export async function joinManually(offer: string): Promise<void> {
  stopLooking();
  disconnect();
  set({ phase: { kind: "manualGuest", reply: null }, error: null });
  try {
    const made = await answerConnection(offer, turn());
    if (state.phase.kind !== "manualGuest") return made.cancel();
    attempt = made;
    set({ phase: { kind: "manualGuest", reply: made.code } });
    void made.link.then((peer) => {
      if (attempt === made) connected("guest", peer);
    });
  } catch (err) {
    set({ phase: { kind: "idle" }, error: err instanceof BadCodeError ? "online.badOffer" : "online.failed" });
  }
}

export function sendChat(text: string): void {
  const line = text.trim().slice(0, CHAT_MAX);
  if (!link || line === "") return;
  link.send({ t: "chat", text: line });
  set({ chat: [...state.chat, { from: "me" as const, text: line }].slice(-200) });
}

/** Stop looking, or leave the connection (the other side is told). */
export function leave(): void {
  link?.send({ t: "bye" });
  stopLooking();
  disconnect();
  set({ phase: { kind: "idle" }, error: null });
}
