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
  PlayerId,
  PlayerView,
  PrintingId,
} from "@sve/core";

/** Who plays a seat: a person at this screen, or a bot run by the worker. */
export type SeatController = "human" | "greedy" | "random";

export interface GameOptions {
  seed: string;
  decks: [DeckList, DeckList];
  /** Shown in the GUI and saved in replays. */
  deckNames: [string, string];
  controllers: [SeatController, SeatController];
  /** GameConfig.deckRestrictions (CLAUDE.md: the "deck restrictions" switch). */
  deckRestrictions: boolean;
  /**
   * Ask for every main phase, also when ending it is all that is left, so a person has time to look before the turn
   * moves on (the core's autoResolve without "mainPhase": pacing only, the rules are the same). Bots answer those at
   * once. Replays saved without it replay as the core decides by default.
   */
  showEveryMainPhase?: boolean;
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

/** The decision a person must answer, with what the GUI needs to show it. */
export interface DecisionInfo {
  decision: Decision;
  /** Every card the decision mentions that its player may see. */
  cards: Record<CardId, CardInfo>;
  /** Activated abilities (`card:ability`) and pending automatic abilities (their pending id). */
  abilities: Record<string, AbilitySummary & { source?: CardId; sourceDef?: DefId }>;
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
