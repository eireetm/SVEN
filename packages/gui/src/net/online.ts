// Online play (docs/online.md), in the online screen's module: making the connection (a room code on the public networks,
// or codes passed by hand), preparing a game (the host's rules, each player's locked deck, a seed both players make), and
// the game itself: this program's answers go to the other program, the other's come to this engine worker, each with the
// sender's state (engine/game-host.ts). After a lost connection, the same room connects again and the answers the other side
// is missing are sent again. The state lives in net/state.ts.
import type { Catalog } from "../app/catalog";
import { getSettings } from "../app/settings";
import { engine, getApp } from "../app/store";
import { DECK_FORMAT, toDeckList, type DeckFile } from "../decks/format";
import type { FromWorker, GameOptions } from "../engine/protocol";
import { checkDeck } from "../formats/check";
import { leadersFor, type FormatProblem } from "../formats/formats";
import { RESTRICTION_LISTS, restrictionList } from "../formats/lists";
import { newRoomCode } from "./codes";
import type { PeerLink } from "./link";
import { answerConnection, BadCodeError, offerConnection, type ManualAttempt } from "./manual";
import type { Hello, NetMessage, ReadyDeck, Rules } from "./messages";
import type { TurnServer } from "./relays";
import { meet, type Meeting } from "./rooms";
import { currentLink, gameStarted, getOnline, NO_PREP, setLink, setOnline, type Prep } from "./state";

export { sendChat, useOnline, getOnline, type OnlinePhase } from "./state";

/** The protocol these messages follow (a program with another one can't play with this one). */
export const PROTOCOL = "online-2";

declare const __ENGINE_FINGERPRINT__: string;
/** The rules code's fingerprint (vite.config.ts); "dev" where the build didn't make one (tests). */
export const ENGINE = typeof __ENGINE_FINGERPRINT__ === "string" ? __ENGINE_FINGERPRINT__ : "dev";

// What this program tells the other one (the card data's fingerprint once the catalog is known).
let hello: Hello = { t: "hello", version: PROTOCOL, cards: "", engine: ENGINE };

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const randomHex = (bytes: number): string => [...crypto.getRandomValues(new Uint8Array(bytes))].map((b) => b.toString(16).padStart(2, "0")).join("");

/**
 * A short fingerprint of the card pool (definitions and how complete their scripts are) and of the restriction lists: two
 * programs play the same cards and check decks the same way.
 */
export async function cardsFingerprint(catalog: Catalog): Promise<string> {
  return (await sha256(JSON.stringify({ cards: catalog.cards.map((card) => [card.id, card.status]), lists: RESTRICTION_LISTS }))).slice(0, 16);
}

export async function identify(catalog: Catalog): Promise<void> {
  hello = { t: "hello", version: PROTOCOL, cards: await cardsFingerprint(catalog), engine: ENGINE };
  // Connected before the fingerprint was ready: the other side learns it now.
  currentLink()?.send(hello);
}

/** Whether the other program can play with this one (null: not known yet). */
export function samePrograms(peer: Hello | null): boolean | null {
  return peer === null || hello.cards === "" ? null : peer.version === hello.version && peer.cards === hello.cards && peer.engine === hello.engine;
}

/** A deck file locked for a game: the leader the engine plays with, the other one shown (Cross Craft, formats.ts leadersFor). */
export function readyDeckOf(deck: DeckFile, rules: Rules, catalog: Catalog): ReadyDeck {
  const { leader, second } = leadersFor(deck, rules.format, catalog);
  return { name: deck.name, deck: toDeckList(deck, leader), leader2: second };
}

/** The deck file a locked deck came from (as far as the check needs it). */
function deckFileOf(ready: ReadyDeck): DeckFile {
  const counts = (cards: readonly string[]) => {
    const out: Record<string, number> = {};
    for (const card of cards) out[card] = (out[card] ?? 0) + 1;
    return out;
  };
  return {
    format: DECK_FORMAT,
    version: 1,
    name: ready.name,
    ...(ready.deck.leader ? { leader: ready.deck.leader } : {}),
    ...(ready.leader2 ? { leader2: ready.leader2 } : {}),
    main: counts(ready.deck.main),
    evolve: counts(ready.deck.evolve),
  };
}

/** A deck's problems under the game's rules (the check the deck's own program made before sending it, made here again). */
export function problemsUnder(rules: Rules, deck: DeckFile, catalog: Catalog): Promise<FormatProblem[]> {
  return checkDeck(deck, rules.format, restrictionList(rules.list), catalog);
}

// The attempt under way, and the connection.
let meeting: Meeting | null = null;
let attempt: (ManualAttempt & { accept?: (reply: string) => Promise<void> }) | null = null;
let pinger: number | null = null;
let pingSent = new Map<number, number>();
let pingSeq = 0;
/** When the other side last answered a ping, and how many pings it hasn't answered since. */
let lastPong = 0;
let unanswered = 0;

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
  const link = currentLink();
  if (link) {
    link.onClose = null;
    link.onMessage = null;
    link.close();
  }
  setLink(null);
}

/** Whether a game over the connection is being played (not over yet). */
function playing(): boolean {
  const update = getApp().update;
  return getOnline().game !== null && update?.online != null && !update.result;
}

/** Whether leaving now would concede a game in progress (the screens ask first). */
export const leavingConcedes = (): boolean => playing();

const setPrep = (change: Partial<Prep>): void => setOnline({ prep: { ...getOnline().prep, ...change } });

/** Connected: say who this program is, keep measuring the round trip, answer the other side; a game in progress goes on. */
function connected(role: "host" | "guest", peer: PeerLink): void {
  // The attempt that connected now belongs to the link (the meeting has left its other networks already): not cancelled.
  meeting = null;
  attempt = null;
  disconnect();
  setLink(peer);
  const game = getOnline().game;
  const going = playing();
  resetSeed();
  setOnline({
    phase: { kind: "connected", role, via: peer.via, route: "unknown", rtt: null, peer: null },
    error: null,
    // A new connection prepares a new game (the host's rules again); after a lost one, the game in progress goes on.
    ...(going ? { prep: { ...getOnline().prep, starting: false } } : { chat: [], prep: { ...NO_PREP, rules: role === "host" ? hostRules() : null } }),
  });
  const lost = () => {
    disconnect();
    resetSeed();
    setOnline({ phase: { kind: "closed", reason: "lost" }, prep: { ...getOnline().prep, starting: false } });
  };
  peer.onMessage = (message) => void receive(message);
  peer.onClose = lost;
  peer.send(hello);
  if (role === "host") sendRules();
  if (going && game) peer.send({ t: "resume", game: game.id, have: getApp().update?.inputCount ?? 0 });
  lastPong = performance.now();
  unanswered = 0;
  const ping = () => {
    // A network that dropped may leave the connection open for half a minute: no answer for a while means it is gone. (Pings
    // unanswered, not only time: a hidden tab runs its timers late.)
    if (unanswered >= 4 && performance.now() - lastPong > 15_000) return lost();
    const n = ++pingSeq;
    pingSent.set(n, performance.now());
    unanswered++;
    peer.send({ t: "ping", n });
  };
  ping();
  pinger = window.setInterval(ping, 3000);
  // The route is known once the connection has settled.
  for (const ms of [800, 4000]) {
    window.setTimeout(() => {
      if (currentLink() !== peer) return;
      void peer.route().then((route) => {
        const phase = getOnline().phase;
        if (currentLink() === peer && phase.kind === "connected") setOnline({ phase: { ...phase, route } });
      });
    }, ms);
  }
}

async function receive(message: NetMessage): Promise<void> {
  const state = getOnline();
  const phase = state.phase;
  if (phase.kind !== "connected") return;
  const link = currentLink();
  switch (message.t) {
    case "hello":
      setOnline({ phase: { ...phase, peer: message } });
      await seedStep();
      break;
    case "chat":
      setOnline({ chat: [...state.chat, { from: "peer" as const, text: message.text }].slice(-200) });
      break;
    case "ping":
      link?.send({ t: "pong", n: message.n });
      break;
    case "pong": {
      const sentAt = pingSent.get(message.n);
      pingSent.delete(message.n);
      lastPong = performance.now();
      unanswered = 0;
      if (sentAt !== undefined) setOnline({ phase: { ...phase, rtt: Math.round(performance.now() - sentAt) } });
      break;
    }
    case "bye":
      disconnect();
      resetSeed();
      setOnline({ phase: { kind: "closed", reason: "left" }, prep: { ...state.prep, starting: false } });
      break;
    case "rules":
      // The host set (or changed) the rules: decks are checked again, so nobody is ready any more.
      if (phase.role === "guest") {
        resetSeed();
        const wasReady = state.prep.mine !== null;
        setOnline({ prep: { ...NO_PREP, rules: message.rules } });
        if (wasReady) link?.send({ t: "ready", deck: null });
      }
      break;
    case "ready": {
      if (!message.deck) {
        resetSeed();
        setPrep({ theirs: null, theirsProblems: null, starting: false });
        break;
      }
      setPrep({ theirs: message.deck, theirsProblems: null });
      const { rules } = getOnline().prep;
      const catalog = getApp().catalog;
      if (!rules || !catalog) break;
      const problems = await problemsUnder(rules, deckFileOf(message.deck), catalog);
      // Still the deck that was checked (not taken back or changed meanwhile).
      if (getOnline().prep.theirs !== message.deck) break;
      setPrep({ theirsProblems: problems });
      await seedStep();
      break;
    }
    case "commit":
      if (phase.role === "guest") {
        commit = message.hash;
        await seedStep();
      }
      break;
    case "nonce":
      if (phase.role === "host" && secret) {
        nonce = message.value;
        await seedStep();
      }
      break;
    case "start":
      if (phase.role === "guest" && commit && nonce && (await sha256(message.secret)) === commit) {
        secret = message.secret;
        await seedStep();
      }
      break;
    case "input":
      if (state.game) engine.send({ kind: "remoteInput", index: message.index, input: message.input, hash: message.hash });
      break;
    case "resume":
      // The other side is back: the answers of this side it hasn't played.
      if (state.game && message.game === state.game.id) {
        for (const m of sent) if (m.index >= message.have || m.input.type === "concede") link?.send({ t: "input", index: m.index, input: m.input, hash: m.hash });
      }
      break;
    default:
      break;
  }
}

// Preparing a game. The seed in three steps (docs/online.md): with both decks locked, the host sends the hash of a secret;
// the guest answers with a random part; the host reveals its secret; the seed is the hash of both. Neither can choose it.
// From the host's first step on, neither player can take their deck back: the host may be starting the game already.
let secret: string | null = null;
let commit: string | null = null;
let nonce: string | null = null;

function resetSeed(): void {
  secret = null;
  commit = null;
  nonce = null;
}

async function seedStep(): Promise<void> {
  const { phase, prep } = getOnline();
  const link = currentLink();
  if (phase.kind !== "connected" || !link || !prep.mine || !prep.theirs || !prep.rules) return;
  // The other deck checked here too, and the two programs the same.
  if (prep.theirsProblems?.length !== 0 || samePrograms(phase.peer) !== true) return;
  if (phase.role === "host") {
    if (!secret) {
      secret = randomHex(16);
      setPrep({ starting: true });
      link.send({ t: "commit", hash: await sha256(secret) });
    } else if (nonce) {
      const seed = (await sha256(`${secret}:${nonce}`)).slice(0, 24);
      link.send({ t: "start", secret });
      begin(seed, 0);
    }
  } else if (commit && !nonce) {
    nonce = randomHex(16);
    setPrep({ starting: true });
    link.send({ t: "nonce", value: nonce });
  } else if (commit && nonce && secret) {
    begin((await sha256(`${secret}:${nonce}`)).slice(0, 24), 1);
  }
}

/** The game's options, the same on both sides (but whose seat is whose): the host's deck is player 1's. */
export function onlineOptions(seed: string, rules: Rules, host: ReadyDeck, guest: ReadyDeck, seat: 0 | 1): GameOptions {
  return {
    seed,
    decks: [host.deck, guest.deck],
    deckNames: [host.name, guest.name],
    controllers: seat === 0 ? ["human", "remote"] : ["remote", "human"],
    deckRestrictions: rules.format === "standard",
    format: rules.format,
    restrictionList: rules.list,
    secondLeaders: [host.leader2, guest.leader2],
    showEveryMainPhase: true,
    askEveryQuickWindow: true,
    manualActions: false,
    turnOrder: rules.turnOrder,
  };
}

/** This program's answers of the game in progress, to send again after reconnecting. */
let sent: Extract<FromWorker, { kind: "localInput" }>[] = [];

function begin(seed: string, seat: 0 | 1): void {
  const { prep } = getOnline();
  resetSeed();
  if (!prep.rules || !prep.mine || !prep.theirs) return;
  const [host, guest] = seat === 0 ? [prep.mine, prep.theirs] : [prep.theirs, prep.mine];
  const settings = getSettings();
  sent = [];
  engine.send({
    kind: "settings",
    settings: {
      paused: false,
      revealAll: false,
      manualDebug: false,
      announceQuick: settings.announceQuick,
      attackPauseMs: Math.min(settings.botDelayMs, 500),
    },
  });
  engine.send({ kind: "start", options: onlineOptions(seed, prep.rules, host, guest, seat) });
  setOnline({ game: { id: seed, seat, opponent: prep.theirs.name }, prep: { ...NO_PREP, rules: prep.rules } });
  gameStarted();
}

// The engine worker's answers of this program's person go to the other program.
engine.subscribe((message) => {
  if (message.kind !== "localInput" || !getOnline().game) return;
  sent.push(message);
  currentLink()?.send({ t: "input", index: message.index, input: message.input, hash: message.hash });
});

/** The rules in this program's settings (the host's are the game's). */
function hostRules(): Rules {
  const settings = getSettings();
  const format = settings.format;
  const list = format === "unlimited" ? null : (restrictionList(settings.restrictionLists[format])?.id ?? null);
  return { format, list, turnOrder: settings.setupTurnOrder };
}

/** The host: the rules of the next game, from its settings (again whenever they change: both players are then not ready). */
export function updateRules(): void {
  const { phase, prep } = getOnline();
  if (phase.kind !== "connected" || phase.role !== "host" || playing()) return;
  const rules = hostRules();
  if (JSON.stringify(prep.rules) === JSON.stringify(rules)) return;
  resetSeed();
  setOnline({ prep: { ...NO_PREP, rules } });
  sendRules();
  currentLink()?.send({ t: "ready", deck: null });
}

function sendRules(): void {
  const rules = getOnline().prep.rules;
  if (rules) currentLink()?.send({ t: "rules", rules });
}

/** Lock this player's deck for the next game (null: not ready any more). Both ready: the game starts. */
export async function ready(deck: ReadyDeck | null): Promise<void> {
  const { phase, prep } = getOnline();
  if (phase.kind !== "connected" || (deck === null && prep.starting)) return;
  if (!deck) resetSeed();
  setPrep({ mine: deck });
  currentLink()?.send({ t: "ready", deck });
  await seedStep();
}

/** Make a room: its code, to pass to the other player; wait for them. */
export function hostRoom(code = newRoomCode()): void {
  stopLooking();
  disconnect();
  setOnline({ phase: { kind: "hosting", code }, error: null, room: { code, role: "host" } });
  meeting = meet(code, "host", turn(), { onLink: (peer) => connected("host", peer), onFull: () => undefined });
}

/** Join the room of this code (already normalized: codes.ts normalizeRoomCode). */
export function joinRoom(code: string): void {
  stopLooking();
  disconnect();
  setOnline({ phase: { kind: "joining", code }, error: null, room: { code, role: "guest" } });
  meeting = meet(code, "guest", turn(), {
    onLink: (peer) => connected("guest", peer),
    onFull: () => {
      stopLooking();
      setOnline({ phase: { kind: "closed", reason: "full" } });
    },
  });
}

/** After losing the connection: the same room again, in the same role. */
export function reconnect(): void {
  const room = getOnline().room;
  if (!room) return;
  if (room.role === "host") hostRoom(room.code);
  else joinRoom(room.code);
}

/** Codes by hand, the host: make the connection code. */
export async function hostManually(): Promise<void> {
  stopLooking();
  disconnect();
  setOnline({ phase: { kind: "manualHost", offer: null, accepted: false }, error: null, room: null });
  try {
    const made = await offerConnection(turn());
    if (getOnline().phase.kind !== "manualHost") return made.cancel();
    attempt = made;
    setOnline({ phase: { kind: "manualHost", offer: made.code, accepted: false } });
    void made.link.then((peer) => {
      if (attempt === made) connected("host", peer);
    });
  } catch {
    setOnline({ phase: { kind: "idle" }, error: "online.failed" });
  }
}

/** Codes by hand, the host: the guest's reply code completes the connection. */
export async function acceptReply(reply: string): Promise<void> {
  const phase = getOnline().phase;
  if (phase.kind !== "manualHost" || !attempt?.accept) return;
  try {
    await attempt.accept(reply);
    setOnline({ phase: { ...phase, accepted: true }, error: null });
  } catch (err) {
    setOnline({ error: err instanceof BadCodeError ? "online.badReply" : "online.failed" });
  }
}

/** Codes by hand, the guest: from the host's connection code, the reply code. */
export async function joinManually(offer: string): Promise<void> {
  stopLooking();
  disconnect();
  setOnline({ phase: { kind: "manualGuest", reply: null }, error: null, room: null });
  try {
    const made = await answerConnection(offer, turn());
    if (getOnline().phase.kind !== "manualGuest") return made.cancel();
    attempt = made;
    setOnline({ phase: { kind: "manualGuest", reply: made.code } });
    void made.link.then((peer) => {
      if (attempt === made) connected("guest", peer);
    });
  } catch (err) {
    setOnline({ phase: { kind: "idle" }, error: err instanceof BadCodeError ? "online.badOffer" : "online.failed" });
  }
}

/** Stop looking for the other player: back to the start, or, while a game waits for its connection, to the lost connection. */
export function cancel(): void {
  if (!playing()) return leave();
  stopLooking();
  setOnline({ phase: { kind: "closed", reason: "lost" }, error: null });
}

/**
 * Stop looking, or leave the connection (the other side is told). Leaving a game in progress concedes it (CR 1.2.3: a
 * player may concede at any time); without a connection, the other side learns nothing more and sees the connection lost.
 */
export function leave(): void {
  const { game } = getOnline();
  const link = currentLink();
  if (game && playing()) {
    link?.send({ t: "input", index: 0, input: { type: "concede", player: game.seat }, hash: "" });
    engine.send({ kind: "concede", seat: game.seat });
  }
  link?.send({ t: "bye" });
  stopLooking();
  disconnect();
  resetSeed();
  setOnline({ phase: { kind: "idle" }, error: null, prep: NO_PREP, game: null, room: null });
}
