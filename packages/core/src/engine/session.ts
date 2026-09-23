import type { CardDatabase } from "../data/database";
import type { Answer, Decision, Input } from "../model/decision";
import { opponentOf, type PlayerId } from "../model/ids";
import type { GameResult, GameState } from "../model/state";
import type { GameEvent } from "../events/types";
import type { ScriptRegistry } from "../script/types";
import { cloneJson } from "../util/json";
import { collectTriggers } from "./abilities/triggers";
import { EngineError, IllegalInputError } from "./errors";
import { runGame } from "./flow/game";
import type { G } from "./runtime/context";
import type { Proc } from "./runtime/proc";
import { validateAnswer } from "./runtime/validate";
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
    if (from !== undefined && from !== decision.player) {
      throw new IllegalInputError(`waiting for player ${decision.player}, not player ${from}`);
    }
    const error = validateAnswer(decision, input);
    if (error) throw new IllegalInputError(error);
    const answer = cloneJson(input) as Answer;
    this.inputs.push(answer);
    this.pendingDecision = null;
    this.advance(cloneJson(answer));
    return this.takeBuffer();
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

  /** JSON-serializable snapshot (requires checkpoints). */
  snapshot(): GameSnapshot {
    if (!this.checkpoints) throw new EngineError("snapshot() needs a session with checkpoints enabled");
    return { format: 1, checkpoint: cloneJson(this.checkpoint), inputs: cloneJson(this.inputs) };
  }

  /** An independent copy of this game (for search / "what if"). */
  clone(options: SessionOptions = this.options): GameSession {
    return GameSession.restore(this.env, this.snapshot(), options);
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
