// Messages between the GUI (main thread) and the engine worker. The worker owns the game: the core session and the bots
// run there, and the GUI only sends the human players' answers (the core's Decision / Answer protocol, see
// docs/architecture.md) and draws what the worker publishes. Plain JSON only, so the transport can later be Electron IPC or
// the network.
import type {
  Answer,
  CardDefinition,
  CardId,
  DeckList,
  Decision,
  DefId,
  GameEvent,
  GameResult,
  ImplementationStatus,
  Input,
  ManualOptions,
  PlayerId,
  PlayerView,
  PrintingId,
} from "@sve/core";

/**
 * Who plays a seat: a person at this screen, a bot run by the worker, or a person at another program (online play,
 * docs/online.md: their answers come as "remoteInput"). The bots (docs/bot.md): "greedy" is Bot-Easy (the name it had
 * before the levels, kept for saved settings and replays), "medium" plans its turn fairly, "hard" plans reading every
 * hidden card, "hard-beta" is Hard with the beta additions (a lethal search, its mulligan, the leader's defense on a
 * curve), "random" answers at random (testing). Which bots read hidden cards is said in the README only, not in the GUI.
 */
export type SeatController = "human" | "greedy" | "medium" | "hard" | "hard-beta" | "random" | "remote";

/**
 * How decks are built (the GUI checks them, formats/formats.ts): standard (CR 6.1, and a restriction list), Cross Craft (two
 * classes and two leaders, CR Appendix B-2, and its own lists) or unlimited (anything the engine can play).
 */
export type FormatId = "standard" | "crossCraft" | "unlimited";

/**
 * Who goes first: as the rules say (CR 6.2.1.6: a random player decides), a random player, or a given one (GameConfig.firstPlayer:
 * for testing). "random" is drawn from the seed, so a replay goes the same way.
 */
export type TurnOrder = "choose" | "random" | "player1" | "player2";

export interface GameOptions {
  seed: string;
  decks: [DeckList, DeckList];
  /** Shown in the GUI and saved in replays. */
  deckNames: [string, string];
  controllers: [SeatController, SeatController];
  /**
   * GameConfig.deckRestrictions: the engine checks CR 6.1 when the game starts. On in standard; off in Cross Craft (the GUI
   * checked its class rules, which the engine doesn't know) and unlimited.
   */
  deckRestrictions: boolean;
  /** The format the decks were checked in. Replays saved without it: standard with deck restrictions, else unlimited. */
  format?: FormatId;
  /** The restriction list the decks were checked against (its file name, restrictions/), or none. */
  restrictionList?: string | null;
  /**
   * Cross Craft: each seat's second leader card (CR Appendix B-2 6.1.1.1). The engine plays with the deck's one leader: no
   * card refers to a leader card itself, only to the player's leader, so the second is shown beside it (the look only).
   */
  secondLeaders?: [PrintingId | null, PrintingId | null];
  /**
   * The game accepts manual operations (GameConfig.manualActions: testing by hand, outside the rules; docs/gui.md). Local
   * games allow them; the debug sidebar's "manual debugging" shows the menus.
   */
  manualActions?: boolean;
  /**
   * Ask for every main phase, also when ending it is all that is left, so a person has time to look before the turn
   * moves on (the core's autoResolve without "mainPhase": pacing only, the rules are the same). Bots answer those at
   * once. Replays saved without it replay as the core decides by default.
   */
  showEveryMainPhase?: boolean;
  /**
   * The core asks every quick window, also when passing is all its player can do (its autoResolve without "quick"): the
   * host passes those itself (inputs by no seat), and so can first stop after a Quick card or ability for people to see
   * it (QuickAnnouncement). Pacing only. Replays saved without it replay as the core decides by default.
   */
  askEveryQuickWindow?: boolean;
  /** Who goes first (absent: as the rules say). */
  turnOrder?: TurnOrder;
}

/** One input of a game, with the seat that gave it (null: not given by a seat). */
export interface RecordedInput {
  input: Input;
  by: PlayerId | null;
}

/** A replay's summary, for the list of saved replays and its window (Replay.info). */
export interface ReplayInfo {
  /** When it was saved (ISO 8601, the saving computer's clock). */
  savedAt?: string;
  /** How the game ended (null: saved before its end). */
  result: GameResult | null;
  /** The turn it was in when saved. */
  turn: number;
}

/**
 * Everything needed to play a game again exactly: the core is deterministic (seed + decks + inputs). The same file is a
 * replay to watch (docs/gui.md "录像") and a bug report to load and play on from (the debug panel's "复现包").
 */
export interface Replay {
  format: "sve-replay";
  version: 1;
  options: GameOptions;
  inputs: RecordedInput[];
  /** A summary (absent from files saved before 2026-09-29). */
  info?: ReplayInfo;
}

/** Watching a replay (GameUpdate.watch): where the playback is and how it goes. */
export interface WatchState {
  /** Inputs played so far, of `total` (those of the replay the engine can play). */
  position: number;
  total: number;
  playing: boolean;
  /** 1 = the normal pace; 2 = twice as fast. */
  speed: number;
  /** Where each turn begins (turn n at turns[n - 1]), for the progress bar. */
  turns: number[];
  /** The positions a step goes to: after each answer of a player, and after each attack's quick window. */
  stops: number[];
  /** Why the playback ends early: an input the engine refused (a replay from another version of the engine or cards). */
  stopped: string | null;
}

export interface HostSettings {
  /** Pause before each bot answer, so a person can follow. */
  botDelayMs: number;
  /** Debug: show both players' hidden cards (hands, evolve decks). The decks' order is never shown. */
  revealAll: boolean;
  /** Debug: bots wait for "step" instead of playing on. */
  paused: boolean;
  /** Debug: manual debugging is on — updates carry what can be done by hand (GameUpdate.manual). */
  manualDebug: boolean;
  /** After each Quick card or ability, the game waits until a person has seen it (GameUpdate.announcement). */
  announceQuick: boolean;
  /**
   * After an attack is declared, the quick window where passing is all its player can do (CR 8.4.7) is shown this long
   * before the host passes it: the attack's arrow stands before its combat (0: at once). Needs askEveryQuickWindow.
   */
  attackPauseMs: number;
}

export type ToWorker =
  | { kind: "start"; options: GameOptions }
  | { kind: "answer"; seat: PlayerId; answer: Answer }
  | { kind: "concede"; seat: PlayerId }
  /** Play the game again from the start with its first `inputs` inputs (undo, rewind). */
  | { kind: "rewind"; inputs: number }
  | { kind: "loadReplay"; replay: Replay; inputs?: number }
  | { kind: "exportReplay"; requestId: number }
  | { kind: "settings"; settings: Partial<HostSettings> }
  /** Debug: let a paused bot give one answer. */
  | { kind: "step" }
  /** A person has seen the announcement `seq`: the game goes on. */
  | { kind: "acknowledge"; seq: number }
  /**
   * Online play: an answer of the remote seat, the `index`th input of the game (0 = the first); `hash` is the other program's
   * state before it (stateHash), which this game must have too. Applied once this game has reached it, in order.
   */
  | { kind: "remoteInput"; index: number; input: Input; hash: string }
  /** Watch a replay from its start (nobody plays: its inputs are played back, docs/gui.md "录像"). */
  | { kind: "watch"; replay: Replay }
  /**
   * Online play, a spectator (docs/online.md "观战"): the game two other programs play, from its options (both seats
   * "remote") and its inputs so far (played at once); the players' next answers come as "remoteInput", passed on by the host.
   */
  | { kind: "spectate"; options: GameOptions; inputs: RecordedInput[] }
  /** A spectator: which side of the table is at the bottom (both are shown as the other player sees them). */
  | { kind: "spectatorSide"; perspective: PlayerId }
  /**
   * The playback of the replay being watched: play or pause, its speed, go to a position (0: the start), one step forward
   * or back, whose view (with or without both players' hidden cards: HostSettings.revealAll).
   */
  | { kind: "watchControl"; playing?: boolean; speed?: number; seek?: number; step?: 1 | -1; perspective?: PlayerId }
  | { kind: "validateDeck"; requestId: number; deck: DeckList; deckRestrictions: boolean };

/** A card's definition and printing, for cards the viewer may see. */
export interface CardInfo {
  def: DefId;
  printing: PrintingId | null;
}

/** How an ability reads on a button: its kind, timing and cost (the GUI words it). */
export interface AbilitySummary {
  kind: "activated" | "automatic" | "spell" | "unknown";
  timing?: string;
  pp?: number;
  engage?: boolean;
  bury?: boolean;
  leaderDefense?: number;
  /** A cost the card text describes (e.g. "discard a card"). */
  custom?: boolean;
  quick?: boolean;
  advanced?: boolean;
  /** A given ability (not printed on the card). */
  granted?: boolean;
}

/** What a person may do by hand now (manual debugging, at a main phase decision of a game that allows it). */
export interface ManualInfo extends ManualOptions {
  /** How the activated abilities in `activatable` read ("card:index"). */
  abilities: Record<string, AbilitySummary>;
  /** Each player's deck: the definitions in it and how many (the order stays hidden). */
  decks: [Record<DefId, number>, Record<DefId, number>];
}

/** The decision a person must answer, with what the GUI needs to show it. */
export interface DecisionInfo {
  decision: Decision;
  /** Every card the decision mentions that its player may see. */
  cards: Record<CardId, CardInfo>;
  /** Activated abilities (`card:ability`) and pending automatic abilities (their pending id). */
  abilities: Record<string, AbilitySummary & { source?: CardId; sourceDef?: DefId }>;
}

/** A choice made by a "choose" decision: its options and the chosen ones (options of a card, 5.18; X; a token ...). */
export interface ChoiceMade {
  reason: Extract<Decision, { type: "choose" }>["reason"];
  options: { id: string; label: string }[];
  ids: string[];
}

/**
 * A Quick card or Quick activated ability played at quick timing (CR 7.4.5 / 8.4.7) has resolved: what the people at the
 * screen are told before the game goes on (the host waits for "acknowledge"). Public information only: the card played,
 * the cards selected in public zones (CR 10.6.2.3, the cardsSelected events) and the choices announced.
 */
export interface QuickAnnouncement {
  /** Tells announcements apart (for "acknowledge"). */
  seq: number;
  player: PlayerId;
  /** The card played, or the card whose ability was activated. */
  card: CardInfo;
  /** Null: the card was played; else the index of its activated ability. */
  ability: number | null;
  /** The played card's id in the resolution zone (CR 4.1.4), or the card whose ability it is: the animations leave it to the announcement. */
  source: CardId;
  targets: { id: CardId; card: CardInfo }[];
  choices: ChoiceMade[];
}

/** An event for the game log, already hidden for the log's viewer (CR 4.1.2), with the cards it names. */
export interface LogEntry {
  seq: number;
  turn: number;
  event: GameEvent;
  cards: Record<CardId, CardInfo>;
}

export interface GameUpdate {
  seed: string;
  controllers: [SeatController, SeatController];
  deckNames: [string, string];
  format: FormatId;
  /** Cross Craft: each seat's second leader (GameOptions.secondLeaders). */
  secondLeaders: [PrintingId | null, PrintingId | null];
  /** What can be done by hand now (null: manual debugging off, not a main phase decision, or not allowed in this game). */
  manual: ManualInfo | null;
  /** A Quick card or ability just resolved: the game waits until a person has seen it (null: nothing to see). */
  announcement: QuickAnnouncement | null;
  /** A replay being watched (null: a game being played). */
  watch: WatchState | null;
  /**
   * Online play (null: a local game): this program's seat and the one the other program plays (both null: a spectator,
   * who watches the two players' programs), and whether the games differ.
   */
  online: { seat: PlayerId | null; remote: PlayerId | null; desync: string | null; spectating: boolean } | null;
  /** Whose view this is (the human's seat; in hot seat, the player who must decide). */
  perspective: PlayerId;
  view: PlayerView;
  decision: DecisionInfo | null;
  waitingFor: PlayerId | null;
  /** A bot is about to answer. */
  thinking: boolean;
  inputCount: number;
  /** Positions in the input list of the answers people gave (undo goes back to the last one). */
  humanInputs: number[];
  result: GameResult | null;
  /** New log entries (or the whole log again when `logReset`). */
  log: LogEntry[];
  logReset: boolean;
  settings: HostSettings;
}

export type CatalogCard = CardDefinition & { status: ImplementationStatus };

export type FromWorker =
  | { kind: "ready"; catalog: CatalogCard[] }
  /** Online play: an answer of this program's person, the `index`th input, with the state before it: for the other program. */
  | { kind: "localInput"; index: number; input: Input; hash: string }
  | { kind: "update"; update: GameUpdate }
  | { kind: "replay"; requestId: number; replay: Replay | null }
  | { kind: "deckValidation"; requestId: number; errors: string[] }
  | { kind: "error"; message: string };
