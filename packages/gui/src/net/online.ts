// Online play, in the online screen's module: making the connection (a room code on the public networks,
// or codes passed by hand), preparing a game (the host's rules, each player's locked deck, a seed both players make), and
// the game itself: this program's answers go to the other program, the other's come to this engine worker, each with the
// sender's state (engine/game-host.ts). After a lost connection, the same room connects again and the answers the other side
// is missing are sent again. Spectators ("观战", up to two) join the host's room: the host tells them the game (its options
// and its inputs so far) and passes on both players' answers and the chat; they can't do anything else. The state lives
// in net/state.ts.
import type { Catalog } from "../app/catalog";
import { getSettings } from "../app/settings";
import { engine, getApp } from "../app/store";
import { APP_VERSION, PLATFORM } from "../app/version";
import { DECK_FORMAT, toDeckList, type DeckFile } from "../decks/format";
import type { FromWorker, GameOptions, RecordedInput } from "../engine/protocol";
import { checkDeck } from "../formats/check";
import { leadersFor, type FormatProblem } from "../formats/formats";
import { RESTRICTION_LISTS, restrictionList } from "../formats/lists";
import { newRoomCode } from "./codes";
import type { PeerLink } from "./link";
import { answerConnection, BadCodeError, offerConnection, type ManualAttempt } from "./manual";
import { BACKLOG_PIECE, SPECTATOR_SEATS, watchedOptions, type Hello, type JoinAs, type NetMessage, type ReadyDeck, type Rules, type WatchedGame } from "./messages";
import type { TurnServer } from "./relays";
import { meet, type Admission, type Meeting } from "./rooms";
import { currentLink, gameStarted, getOnline, NO_PREP, setChatRelay, setLink, setOnline, type OnlineRole, type Prep } from "./state";

export { sendChat, useOnline, getOnline, canChat, type OnlinePhase } from "./state";

/** The protocol these messages follow (a program with another one can't play with this one, or watch its games). */
export const PROTOCOL = "online-3";

declare const __ENGINE_FINGERPRINT__: string;
/** The rules code's fingerprint (vite.config.ts); "dev" where the build didn't make one (tests). */
export const ENGINE = typeof __ENGINE_FINGERPRINT__ === "string" ? __ENGINE_FINGERPRINT__ : "dev";

// What this program tells the other one (the card data's fingerprint once the catalog is known).
let hello: Hello = { t: "hello", version: PROTOCOL, cards: "", engine: ENGINE, app: APP_VERSION, platform: PLATFORM };

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
  hello = { t: "hello", version: PROTOCOL, cards: await cardsFingerprint(catalog), engine: ENGINE, app: APP_VERSION, platform: PLATFORM };
  // Connected before the fingerprint was ready: the other side learns it now.
  currentLink()?.send(hello);
  for (const w of watchers) w.link.send(hello);
}

/** Whether the other program can play with this one (null: not known yet). A spectator's must be the same too. */
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

// The attempt under way, and the connection. The host's room (`meeting`) stays while it is connected: spectators come to it,
// and the other player comes back to it after a lost connection.
let meeting: Meeting | null = null;
let attempt: (ManualAttempt & { accept?: (reply: string) => Promise<void> }) | null = null;
let pinger: number | null = null;
let pingSent = new Map<number, number>();
let pingSeq = 0;
/** When the other side last answered a ping, and how many pings it hasn't answered since. */
let lastPong = 0;
let unanswered = 0;
/** A spectator: after a lost connection, it looks for the host's room again by itself (this timer). */
let rewatch: number | null = null;

const turn = (): TurnServer | null => {
  const t = getSettings().turn;
  return t.urls.trim() !== "" ? t : null;
};

function stopLooking(): void {
  meeting?.cancel();
  meeting = null;
  attempt?.cancel();
  attempt = null;
  if (rewatch !== null) window.clearTimeout(rewatch);
  rewatch = null;
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

/** Whether leaving now would concede a game in progress (the screens ask first). A spectator concedes nothing. */
export const leavingConcedes = (): boolean => playing() && getOnline().game?.seat !== null;

const setPrep = (change: Partial<Prep>): void => setOnline({ prep: { ...getOnline().prep, ...change } });

/** Keep measuring the round trip on the connection, and notice when it is gone (no answer for a while). */
function startPinging(peer: PeerLink, lost: () => void): void {
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

function pong(n: number): void {
  const phase = getOnline().phase;
  const sentAt = pingSent.get(n);
  pingSent.delete(n);
  lastPong = performance.now();
  unanswered = 0;
  if (sentAt !== undefined && phase.kind === "connected") setOnline({ phase: { ...phase, rtt: Math.round(performance.now() - sentAt) } });
}

/** Connected to the other player: say who this program is, keep measuring the round trip, answer; a game in progress goes on. */
function connected(role: "host" | "guest", peer: PeerLink): void {
  // A joining program's room now belongs to its link (closing the link leaves it); the host keeps its room.
  if (role === "guest") meeting = null;
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
  if (role === "host") {
    sendRules();
    peer.send({ t: "watchers", n: watchers.length });
  }
  if (going && game) peer.send({ t: "resume", game: game.id, have: getApp().update?.inputCount ?? 0 });
  startPinging(peer, lost);
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
      // The host's spectators read the other player's lines too (the other player is player 2).
      if (phase.role === "host") toWatchers({ t: "chat", text: message.text, seat: 1 });
      break;
    case "ping":
      link?.send({ t: "pong", n: message.n });
      break;
    case "pong":
      pong(message.n);
      break;
    case "watchers":
      if (phase.role === "guest") setOnline({ watchers: message.n });
      break;
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
      if (state.game) {
        // The host's spectators see the other player's answers too.
        if (phase.role === "host") toWatchers(message);
        engine.send({ kind: "remoteInput", index: message.index, input: message.input, hash: message.hash });
      }
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

// Preparing a game. The seed in three steps: with both decks locked, the host sends the hash of a secret;
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
  if (phase.kind !== "connected" || phase.role === "spectator" || !link || !prep.mine || !prep.theirs || !prep.rules) return;
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

/** A game's options as a spectator's program needs them (messages.ts watchedOptions makes them back), with its backlog's size. */
function watchedGame(options: GameOptions, backlog: number): WatchedGame {
  return {
    id: options.seed,
    decks: options.decks,
    deckNames: options.deckNames,
    deckRestrictions: options.deckRestrictions,
    format: options.format ?? (options.deckRestrictions ? "standard" : "unlimited"),
    restrictionList: options.restrictionList ?? null,
    secondLeaders: options.secondLeaders ?? [null, null],
    turnOrder: options.turnOrder ?? "choose",
    backlog,
  };
}

/** This program's answers of the game in progress, to send again after reconnecting. */
let sent: Extract<FromWorker, { kind: "localInput" }>[] = [];

function begin(seed: string, seat: 0 | 1): void {
  const { prep } = getOnline();
  resetSeed();
  if (!prep.rules || !prep.mine || !prep.theirs) return;
  const [host, guest] = seat === 0 ? [prep.mine, prep.theirs] : [prep.theirs, prep.mine];
  sent = [];
  engine.send({ kind: "settings", settings: playSettings() });
  const options = onlineOptions(seed, prep.rules, host, guest, seat);
  engine.send({ kind: "start", options });
  setOnline({ game: { id: seed, seat, opponent: prep.theirs.name }, prep: { ...NO_PREP, rules: prep.rules } });
  // The host's spectators watch the new game from its start.
  if (seat === 0) toWatchers({ t: "watch", game: watchedGame(options, 0) });
  gameStarted();
}

/** The engine's settings for a game over the connection (played or watched): nothing hidden shown, no manual debugging. */
function playSettings() {
  const settings = getSettings();
  return { paused: false, revealAll: false, manualDebug: false, announceQuick: settings.announceQuick, attackPauseMs: Math.min(settings.botDelayMs, 500) };
}

// The engine worker's answers of this program's person go to the other program (and the host's, to its spectators).
engine.subscribe((message) => {
  if (message.kind !== "localInput" || !getOnline().game) return;
  sent.push(message);
  const input: NetMessage = { t: "input", index: message.index, input: message.input, hash: message.hash };
  currentLink()?.send(input);
  toWatchers(input);
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
  if (phase.kind !== "connected" || phase.role === "spectator" || (deck === null && prep.starting)) return;
  if (!deck) resetSeed();
  setPrep({ mine: deck });
  currentLink()?.send({ t: "ready", deck });
  await seedStep();
}

// ---- The host's spectators ----

/** A spectator connected to the host: what it was sent waits until it has the game's inputs so far (its backlog). */
interface Watcher {
  link: PeerLink;
  ready: boolean;
  queue: NetMessage[];
  /** When it last said something (it pings every few seconds): a silent one is let go. */
  lastSeen: number;
}

let watchers: Watcher[] = [];
/** Checks the spectators now and then (while there are any). */
let watcherTimer: number | null = null;

/** The host: whether it takes in a program asking for a seat (rooms.ts): the other player's while it has none, or a spectator's. */
function admit(as: JoinAs): Admission {
  if (as === "player") return currentLink() ? "full" : "yes";
  return watchers.length < SPECTATOR_SEATS ? "yes" : "full";
}

function toWatchers(message: NetMessage): void {
  for (const w of watchers) {
    if (w.ready) w.link.send(message);
    else w.queue.push(message);
  }
}

/** Everyone connected to the host learns how many spectators there are. */
function countWatchers(): void {
  const n = watchers.length;
  setOnline({ watchers: n });
  currentLink()?.send({ t: "watchers", n });
  for (const w of watchers) w.link.send({ t: "watchers", n });
}

function addWatcher(link: PeerLink): void {
  const w: Watcher = { link, ready: false, queue: [], lastSeen: performance.now() };
  watchers = [...watchers, w];
  link.onMessage = (message) => {
    w.lastSeen = performance.now();
    if (message.t === "ping") link.send({ t: "pong", n: message.n });
    else if (message.t === "bye") dropWatcher(w);
  };
  link.onClose = () => dropWatcher(w);
  link.send(hello);
  countWatchers();
  watcherTimer ??= window.setInterval(dropSilentWatchers, 5000);
  void sendGame(w);
}

function dropWatcher(w: Watcher, say = false): void {
  if (!watchers.includes(w)) return;
  watchers = watchers.filter((x) => x !== w);
  if (say) w.link.send({ t: "bye" });
  w.link.onMessage = null;
  w.link.onClose = null;
  w.link.close();
  if (watchers.length === 0 && watcherTimer !== null) {
    window.clearInterval(watcherTimer);
    watcherTimer = null;
  }
  countWatchers();
}

/** Spectators who haven't said anything for a while are gone (their seats are free again). */
function dropSilentWatchers(): void {
  const now = performance.now();
  for (const w of watchers) if (now - w.lastSeen > 20_000) dropWatcher(w);
}

/**
 * A spectator who came: the game in progress (its options, then its inputs so far, in pieces), or none; then what was
 * passed on meanwhile (answers that came while the game was being read out of the engine).
 */
async function sendGame(w: Watcher): Promise<void> {
  const replay = playing() ? await engine.exportReplay() : null;
  if (!watchers.includes(w)) return;
  if (!replay || replay.options.seed !== getOnline().game?.id) {
    w.link.send({ t: "watch", game: null });
  } else {
    w.link.send({ t: "watch", game: watchedGame(replay.options, replay.inputs.length) });
    for (let start = 0; start < replay.inputs.length; start += BACKLOG_PIECE) {
      w.link.send({ t: "backlog", start, inputs: replay.inputs.slice(start, start + BACKLOG_PIECE) });
    }
  }
  w.ready = true;
  for (const message of w.queue.splice(0)) w.link.send(message);
}

/** Let the spectators go: told so (they stop watching), or not (the host makes its room again: they come back by themselves). */
function dropWatchers(say = true): void {
  for (const w of [...watchers]) dropWatcher(w, say);
  setOnline({ watchers: 0 });
}

// The host's own chat lines (state.ts sendChat): its spectators read them too (the host is player 1).
setChatRelay((text) => {
  if (getOnline().phase.kind === "connected") toWatchers({ t: "chat", text, seat: 0 });
});

// ---- A spectator's side ----

/** The game being watched as it comes from the host: its options, and its inputs so far until all of them are here. */
let incoming: { game: WatchedGame; inputs: RecordedInput[] } | null = null;

/** A spectator connected to the host: it hears the game and the chat; after a lost connection it looks for the room again. */
function watching(peer: PeerLink): void {
  meeting = null;
  disconnect();
  setLink(peer);
  incoming = null;
  setOnline({ phase: { kind: "connected", role: "spectator", via: peer.via, route: "unknown", rtt: null, peer: null }, error: null });
  const lost = () => {
    disconnect();
    setOnline({ phase: { kind: "closed", reason: "lost" } });
    // A spectator only watches: it comes back by itself (the host sends the game again).
    const room = getOnline().room;
    if (room?.role === "spectator") rewatch = window.setTimeout(() => watchRoom(room.code, true), 2000);
  };
  peer.onMessage = (message) => hear(message);
  peer.onClose = lost;
  peer.send(hello);
  startPinging(peer, lost);
}

function hear(message: NetMessage): void {
  const state = getOnline();
  const phase = state.phase;
  if (phase.kind !== "connected" || phase.role !== "spectator") return;
  switch (message.t) {
    case "hello":
      setOnline({ phase: { ...phase, peer: message } });
      break;
    case "ping":
      currentLink()?.send({ t: "pong", n: message.n });
      break;
    case "pong":
      pong(message.n);
      break;
    case "watchers":
      setOnline({ watchers: message.n });
      break;
    case "chat":
      if (message.seat !== undefined) setOnline({ chat: [...state.chat, { from: message.seat, text: message.text }].slice(-200) });
      break;
    case "watch":
      // Another program's games can't be followed (CR-wise the same engine is needed: the fingerprints).
      if (samePrograms(phase.peer) !== true) break;
      incoming = message.game ? { game: message.game, inputs: [] } : null;
      if (!message.game) setOnline({ game: null });
      else if (message.game.backlog === 0) startWatching();
      break;
    case "backlog":
      if (!incoming || message.start !== incoming.inputs.length) break;
      incoming.inputs.push(...message.inputs);
      if (incoming.inputs.length >= incoming.game.backlog) startWatching();
      break;
    case "input":
      if (state.game && !incoming) engine.send({ kind: "remoteInput", index: message.index, input: message.input, hash: message.hash });
      break;
    case "bye":
      disconnect();
      setOnline({ phase: { kind: "closed", reason: "left" } });
      break;
    default:
      break;
  }
}

/** The game and its inputs so far are here: the engine plays them at once, then follows the players' answers. */
function startWatching(): void {
  const coming = incoming;
  if (!coming) return;
  incoming = null;
  engine.send({ kind: "settings", settings: playSettings() });
  engine.send({ kind: "spectate", options: watchedOptions(coming.game), inputs: coming.inputs });
  const continuing = getOnline().game?.id === coming.game.id;
  setOnline({ game: { id: coming.game.id, seat: null, opponent: "" } });
  // A new game shows by itself; the same game again (after a lost connection) just goes on.
  if (!continuing) gameStarted();
}

/** Watch the games in room `code` (a spectator's seat); `again`: after a lost connection (the game shown stays). */
export function watchRoom(code: string, again = false): void {
  stopLooking();
  disconnect();
  dropWatchers();
  setOnline({
    phase: { kind: "joining", code, as: "watch" },
    error: null,
    room: { code, role: "spectator" },
    ...(again ? {} : { game: null, chat: [], watchers: 0, prep: NO_PREP }),
  });
  meeting = meet(code, "watch", turn(), {
    onLink: (peer) => watching(peer),
    onFull: () => {
      stopLooking();
      setOnline({ phase: { kind: "closed", reason: "watchFull" } });
    },
  });
}

/** A spectator: which side of the table is at the bottom. */
export function spectatorSide(perspective: 0 | 1): void {
  engine.send({ kind: "spectatorSide", perspective });
}

// ---- Rooms, codes by hand, leaving ----

/**
 * Make a room: its code, to pass to the other player; wait for them (and spectators). `again`: the same room once more after
 * a lost connection (its spectators aren't told to go: they come back by themselves).
 */
export function hostRoom(code = newRoomCode(), again = false): void {
  stopLooking();
  disconnect();
  dropWatchers(!again);
  setOnline({ phase: { kind: "hosting", code }, error: null, room: { code, role: "host" } });
  meeting = meet(code, "host", turn(), {
    onLink: (peer, as) => (as === "player" ? connected("host", peer) : addWatcher(peer)),
    onFull: () => undefined,
    admit,
  });
}

/** Join the room of this code (already normalized: codes.ts normalizeRoomCode). */
export function joinRoom(code: string): void {
  stopLooking();
  disconnect();
  dropWatchers();
  setOnline({ phase: { kind: "joining", code, as: "player" }, error: null, room: { code, role: "guest" } });
  meeting = meet(code, "player", turn(), {
    onLink: (peer) => connected("guest", peer),
    onFull: () => {
      stopLooking();
      setOnline({ phase: { kind: "closed", reason: "full" } });
    },
  });
}

/**
 * After losing the connection: the same room again, in the same role. The host makes its room again (its own network may
 * have dropped); until then the other player can come back to the room it stayed in.
 */
export function reconnect(): void {
  const room = getOnline().room;
  if (!room) return;
  if (room.role === "host") hostRoom(room.code, true);
  else if (room.role === "spectator") watchRoom(room.code, true);
  else joinRoom(room.code);
}

/** Codes by hand, the host: make the connection code. */
export async function hostManually(): Promise<void> {
  stopLooking();
  disconnect();
  dropWatchers();
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
  dropWatchers();
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
  if (!playing() || getOnline().room?.role === "spectator") return leave();
  // The host stays in its room for the other player to come back.
  if (getOnline().room?.role !== "host") stopLooking();
  setOnline({ phase: { kind: "closed", reason: "lost" }, error: null });
}

/**
 * Stop looking, or leave the connection (the other side is told). Leaving a game in progress concedes it (CR 1.2.3: a
 * player may concede at any time); without a connection, the other side learns nothing more and sees the connection lost.
 * A spectator just goes.
 */
export function leave(): void {
  const { game } = getOnline();
  const link = currentLink();
  if (game && game.seat !== null && playing()) {
    const concede: NetMessage = { t: "input", index: 0, input: { type: "concede", player: game.seat }, hash: "" };
    link?.send(concede);
    toWatchers(concede);
    engine.send({ kind: "concede", seat: game.seat });
  }
  link?.send({ t: "bye" });
  dropWatchers();
  stopLooking();
  disconnect();
  resetSeed();
  incoming = null;
  setOnline({ phase: { kind: "idle" }, error: null, prep: NO_PREP, game: null, room: null, watchers: 0 });
}

/** The role of the connection (or of the room being looked for), for the screens. */
export function onlineRole(): OnlineRole | null {
  const { phase, room } = getOnline();
  return phase.kind === "connected" ? phase.role : (room?.role ?? null);
}
