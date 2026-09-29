import type { CardDatabase } from "../data/database";
import type { Answer, Decision, Input } from "../model/decision";
import { opponentOf, type PlayerId } from "../model/ids";
import { seedRng } from "../rng/rng";
import type { GameResult, GameState } from "../model/state";
import type { GameEvent } from "../events/types";
import type { ScriptRegistry } from "../script/types";
import { cloneJson } from "../util/json";
import { collectTriggers } from "./abilities/triggers";
import { cardsInDecision, resampleHidden } from "./determinize";
import { EngineError, IllegalInputError } from "./errors";
import { runGame } from "./flow/game";
import type { G } from "./runtime/context";
import type { Proc } from "./runtime/proc";
import { validateAnswer } from "./runtime/validate";
import { manualOpError, manualOptions, type ManualOptions } from "./manual";
import type { ManualOp } from "../model/manual";
import { makeReader, type GameReader } from "./query";
import { playerView, type PlayerView } from "../view/player-view";

/**
 * Serializable description of a game in progress: the state at the last checkpoint plus the
 * inputs given since. `engine.restore(snapshot)` rebuilds the exact same game by replaying.
 */
export interface GameSnapshot {
  format: 1;
  checkpoint: GameState;
  inputs: Input[];
}

export interface SessionOptions {
  /**
   * Take a checkpoint at every anchor (default true). Needed for snapshot() / clone().
   * Bot playouts can turn it off: the game then never copies its state.
   */
  checkpoints?: boolean;
}

export interface SessionEnv {
  readonly db: CardDatabase;
  readonly scripts: ScriptRegistry;
}

/**
 * A running game. The live state is advanced by a single generator (runGame); answers are
 * fed to it directly, so normal play never replays. Restoring / cloning replays from the
 * last checkpoint. All state stays plain JSON; this object only holds the live generator.
 */
export class GameSession {
  private live: GameState;
  private gen: Proc<void> | null = null;
  private pendingDecision: Decision | null = null;
  private checkpoint: GameState;
  private inputs: Input[] = [];
  private buffer: GameEvent[] = [];
  private failure: unknown = null;
  /**
   * Set on a copy made by determinized() between anchors: its checkpoint still holds the real hidden
   * cards, so it must not be snapshotted or cloned until the next anchor replaces the checkpoint.
   */
  private checkpointStale = false;
  private readonly g: G;
  private readonly checkpoints: boolean;
  /** Events produced while starting (or restoring) the game, before the first decision. */
  readonly startupEvents: readonly GameEvent[];

  private constructor(
    private readonly env: SessionEnv,
    state: GameState,
    private readonly options: SessionOptions,
  ) {
    this.live = state;
    this.checkpoints = options.checkpoints ?? true;
    this.checkpoint = this.checkpoints ? cloneJson(state) : state;
    const emit = (event: GameEvent) => {
      this.buffer.push(event);
      if (event.type !== "abilityTriggered") collectTriggers(this.g, event);
    };
    const live = () => this.live;
    this.g = {
      get state() {
        return live();
      },
      db: env.db,
      scripts: env.scripts,
      emit,
    };
    this.gen = runGame(this.g);
    this.advance(undefined);
    this.startupEvents = this.takeBuffer();
  }

  /** Start a game from an initial state (see Engine.newGame). */
  static start(env: SessionEnv, state: GameState, options: SessionOptions = {}): GameSession {
    return new GameSession(env, state, options);
  }

  /** Rebuild a game from a snapshot by replaying its inputs. */
  static restore(env: SessionEnv, snapshot: GameSnapshot, options: SessionOptions = {}): GameSession {
    if (snapshot.format !== 1) throw new EngineError(`unsupported snapshot format ${String(snapshot.format)}`);
    const session = new GameSession(env, cloneJson(snapshot.checkpoint), options);
    for (const input of snapshot.inputs) session.act(input);
    return session;
  }

  /** The live state. Treat as read-only. */
  get state(): Readonly<GameState> {
    return this.live;
  }

  /** The decision the game is waiting for; null once the game is over. */
  get decision(): Decision | null {
    return this.pendingDecision;
  }

  get result(): GameResult | null {
    return this.live.result;
  }

  get isOver(): boolean {
    return this.live.result !== null;
  }

  /** Read-only query helpers over the live state. */
  reader(): GameReader {
    return makeReader({ state: this.live, db: this.env.db, scripts: this.env.scripts });
  }

  /** What `player` may see (CR 4.1.2). */
  view(player: PlayerId): PlayerView {
    return playerView({ state: this.live, db: this.env.db, scripts: this.env.scripts }, player, this.pendingDecision);
  }

  /**
   * Apply an input and run the game until the next decision. Returns the events it produced.
   * Throws IllegalInputError (game unchanged) for inputs that are not legal answers.
   * `from`: when given (network / hot-seat), the answer must come from the deciding player.
   */
  act(input: Input, from?: PlayerId): GameEvent[] {
    if (this.failure !== null) throw new EngineError(`session failed earlier: ${String(this.failure)}`);
    if (this.live.result) throw new IllegalInputError("the game is over");
    if (input.type === "concede") {
      if (from !== undefined && from !== input.player) throw new IllegalInputError("a player can only concede for themselves");
      return this.concede(input.player);
    }
    const decision = this.pendingDecision;
    if (!decision) throw new IllegalInputError("no decision is pending");
    const error = isManualInput(input) ? this.manualInputError(decision, input) : this.answerError(decision, input, from);
    if (error) throw new IllegalInputError(error);
    const answer = cloneJson(input) as Answer;
    this.inputs.push(answer);
    this.pendingDecision = null;
    this.advance(cloneJson(answer));
    return this.takeBuffer();
  }

  private answerError(decision: Decision, answer: Answer, from: PlayerId | undefined): string | null {
    if (from !== undefined && from !== decision.player) return `waiting for player ${decision.player}, not player ${from}`;
    return validateAnswer(decision, answer);
  }

  /**
   * A manual operation (model/manual.ts): only in a game that allows them, at a main phase decision (its checkpoint: no
   * procedure is half done), from either player (testing by hand is nobody's turn).
   */
  private manualInputError(decision: Decision, input: Extract<Answer, { type: "mainPhase" }>): string | null {
    if (!this.live.config.manualActions) return "this game doesn't allow manual operations";
    if (decision.type !== "mainPhase") return "manual operations are only possible at a main phase decision";
    return input.action.type === "manual" ? manualOpError(this.g, input.action.op) : "not a manual operation";
  }

  /** CR 1.2.3 — a player concedes: they lose immediately, no Confirmation Timing. */
  private concede(player: PlayerId): GameEvent[] {
    if (player !== 0 && player !== 1) throw new IllegalInputError("bad player");
    this.inputs.push({ type: "concede", player });
    const result: GameResult = { winner: opponentOf(player), losses: [{ player, reason: "concede" }] };
    this.live.result = result;
    this.live.phase = "over";
    this.live.attack = null;
    this.gen?.return(undefined);
    this.gen = null;
    this.pendingDecision = null;
    this.buffer.push({ type: "gameEnded", result });
    return this.takeBuffer();
  }

  /**
   * What can be done by hand now (model/manual.ts), for a GUI's menus: null unless the game allows manual operations and a
   * main phase decision is pending (the only time they are accepted).
   */
  manualOptions(): ManualOptions | null {
    if (!this.live.config.manualActions || this.pendingDecision?.type !== "mainPhase") return null;
    return manualOptions(this.g);
  }

  /** Why a manual operation can't be carried out now (null: it can). */
  manualOpError(op: ManualOp): string | null {
    const decision = this.pendingDecision;
    if (!decision) return "no decision is pending";
    return this.manualInputError(decision, { type: "mainPhase", action: { type: "manual", op } });
  }

  /** JSON-serializable snapshot (requires checkpoints). */
  snapshot(): GameSnapshot {
    if (!this.checkpoints) throw new EngineError("snapshot() needs a session with checkpoints enabled");
    if (this.checkpointStale) throw new EngineError("this determinized copy can only be copied from its next main phase on");
    return { format: 1, checkpoint: cloneJson(this.checkpoint), inputs: cloneJson(this.inputs) };
  }

  /** An independent copy of this game (for search / "what if"). */
  clone(options: SessionOptions = this.options): GameSession {
    return GameSession.restore(this.env, this.snapshot(), options);
  }

  /**
   * A copy of this game as `viewer` knows it (docs/bot.md): every card whose identity `viewer` can't
   * see (CR 4.1.2) is dealt again at random from the same hidden cards (resampleHidden), and future
   * random events are reseeded, so the copy tells nothing the viewer doesn't know. The opponent's
   * deck list counts as known. Same seed, same information → same copy. Needs checkpoints and a
   * game past its setup (bots decide mulligans without looking ahead).
   *
   * At a main phase decision (the one right after its checkpoint) the checkpoint itself is
   * resampled, so the copy can be cloned. Otherwise the real game is replayed first — earlier
   * answers, and decisions the engine answered itself (a main phase with nothing but ending it),
   * may depend on the real cards — and the live state resampled; that copy can be cloned from its
   * next main phase on.
   */
  determinized(viewer: PlayerId, seed: string | number, options: SessionOptions = this.options): GameSession {
    const snapshot = this.snapshot();
    if (snapshot.checkpoint.anchor?.kind !== "mainPhase") throw new EngineError("determinized() needs a game past its setup");
    const keep = new Set(this.pendingDecision?.player === viewer ? cardsInDecision(this.pendingDecision) : []);
    const rng = seedRng(`determinize:${seed}`);
    const futureRng = seedRng(`determinize-rng:${seed}`);
    if (snapshot.inputs.length === 0 && this.pendingDecision?.type === "mainPhase") {
      resampleHidden(snapshot.checkpoint, viewer, rng, keep);
      snapshot.checkpoint.rng = futureRng;
      return GameSession.restore(this.env, snapshot, options);
    }
    const copy = GameSession.restore(this.env, snapshot, options);
    resampleHidden(copy.live, viewer, rng, keep);
    copy.live.rng = futureRng;
    copy.checkpointStale = true;
    return copy;
  }

  private takeBuffer(): GameEvent[] {
    const out = this.buffer;
    this.buffer = [];
    return out;
  }

  private advance(answer: Answer | undefined): void {
    const gen = this.gen;
    if (!gen) return;
    try {
      let step = gen.next(answer);
      while (!step.done) {
        if (step.value.kind === "anchor") {
          if (this.checkpoints) {
            this.checkpoint = cloneJson(this.live);
            this.inputs = [];
            this.checkpointStale = false;
          }
          step = gen.next(undefined);
          continue;
        }
        this.pendingDecision = step.value.decision;
        return;
      }
      this.pendingDecision = null;
      this.gen = null;
    } catch (e) {
      this.failure = e;
      this.pendingDecision = null;
      this.gen = null;
      throw e;
    }
  }
}

/** A manual operation (model/manual.ts) given as the answer to a main phase decision. */
export function isManualInput(input: Input): input is Extract<Answer, { type: "mainPhase" }> {
  return input.type === "mainPhase" && (input as Extract<Answer, { type: "mainPhase" }>).action?.type === "manual";
}
