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

/** Who plays a seat: a person at this screen, or a bot run by the worker. */
export type SeatController = "human" | "greedy" | "random";

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

/** Everything needed to play a game again exactly: the core is deterministic (seed + decks + inputs). */
export interface Replay {
  format: "sve-replay";
  version: 1;
  options: GameOptions;
  inputs: RecordedInput[];
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
  /** The played card's id in the resolution zone (CR 4.1.4), for the animations to know it. */
  played: CardId | null;
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
  | { kind: "update"; update: GameUpdate }
  | { kind: "replay"; requestId: number; replay: Replay | null }
  | { kind: "deckValidation"; requestId: number; errors: string[] }
  | { kind: "error"; message: string };
