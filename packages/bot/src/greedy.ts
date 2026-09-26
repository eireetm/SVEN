import {
  defaultAnswer,
  seedRng,
  validateAnswer,
  type Answer,
  type Decision,
  type Engine,
  type GameSession,
  type PlayerId,
  type PlayerView,
  type RngState,
} from "./core";
import { candidateAnswers } from "./candidates";
import { DEFAULT_WEIGHTS, evaluate, type EvalWeights } from "./evaluate";
import { fastAnswer, lookupFromReader, lookupFromView } from "./policy";

export interface GreedyBotOptions {
  /** Seeds the bot's own randomness (how hidden cards are sampled, which answers are sampled). */
  seed?: string | number;
  weights?: Partial<EvalWeights>;
  /** Most answers compared per decision; each costs one simulation. */
  maxCandidates?: number;
  /** Most inputs one simulation plays before the position is scored where it stands. */
  maxSimulationSteps?: number;
  /**
   * Main phase actions per turn; after that the bot ends its main phase. The player decides how
   * often they repeat something (CR 15.2.1.1), so the bot can never loop forever.
   */
  maxActionsPerTurn?: number;
  /** Decisions per turn; after that the bot only gives default answers, which stop any cycle it can stop. */
  maxDecisionsPerTurn?: number;
  /** Go first when it chooses the turn order (CR 6.2.1.6). */
  goFirst?: boolean;
  /** Keep the opening hand if it has at least this many cards that cost 3 or less (CR 6.2.1.8). */
  mulliganKeepCheap?: number;
}

export interface BotStats {
  decisions: number;
  simulations: number;
  /** Simulations that threw (an engine error, or an answer that isn't legal in that sample). */
  simulationFailures: number;
  /** Why simulations failed: message → count (at most 20 different messages). */
  simulationErrors: Record<string, number>;
  /** Decisions answered with the default answer because the bot itself failed. Should stay 0. */
  fallbacks: number;
  lastError: string | null;
}

/** Ending the main phase wins ties, so an action that changes nothing is never repeated (CR 15.2.1.2). */
const EPSILON = 1e-9;

/**
 * The greedy bot (docs/bot.md). For each decision it tries every candidate answer in a copy of the
 * game as it knows it (GameSession.determinized: the opponent's hidden cards and future random
 * events are sampled), plays on with quick answers until the next main phase decision, scores the
 * result with a card-agnostic evaluation and picks the best. In its main phase it compares every
 * action with ending the main phase, and acts while an action improves the position.
 *
 * It only reads what its player may see (the view, its own decision), so it doesn't cheat, and it
 * is deterministic for a given seed. `decide` never throws while a decision is pending: any
 * failure falls back to the default answer, and every answer is checked with validateAnswer.
 */
export class GreedyBot {
  readonly stats: BotStats = { decisions: 0, simulations: 0, simulationFailures: 0, simulationErrors: {}, fallbacks: 0, lastError: null };
  private readonly weights: EvalWeights;
  private readonly seed: string;
  private readonly maxCandidates: number;
  private readonly maxSimulationSteps: number;
  private readonly maxActionsPerTurn: number;
  private readonly maxDecisionsPerTurn: number;
  private readonly goFirst: boolean;
  private readonly mulliganKeepCheap: number;
  private readonly rng: RngState;
  private simulatedDecisions = 0;
  private turn = -1;
  private actionsThisTurn = 0;
  private decisionsThisTurn = 0;

  constructor(
    private readonly engine: Engine,
    options: GreedyBotOptions = {},
  ) {
    this.weights = { ...DEFAULT_WEIGHTS, ...options.weights, keywords: { ...DEFAULT_WEIGHTS.keywords, ...options.weights?.keywords } };
    this.seed = String(options.seed ?? "greedy");
    this.maxCandidates = options.maxCandidates ?? 32;
    this.maxSimulationSteps = options.maxSimulationSteps ?? 200;
    this.maxActionsPerTurn = options.maxActionsPerTurn ?? 40;
    this.maxDecisionsPerTurn = options.maxDecisionsPerTurn ?? 300;
    this.goFirst = options.goFirst ?? true;
    this.mulliganKeepCheap = options.mulliganKeepCheap ?? 2;
    this.rng = seedRng(`bot:${this.seed}`);
  }

  /** Answer the decision `session` is waiting for (for whichever player it asks). */
  decide(session: GameSession): Answer {
    const d = session.decision;
    if (!d) throw new Error("GreedyBot.decide: the game isn't waiting for a decision");
    this.stats.decisions += 1;
    try {
      const answer = this.choose(session, d);
      const problem = validateAnswer(d, answer);
      if (problem) throw new Error(`illegal answer (${problem})`);
      return answer;
    } catch (e) {
      this.stats.fallbacks += 1;
      this.stats.lastError = e instanceof Error ? e.message : String(e);
      return defaultAnswer(d);
    }
  }

  /** The bot as a function (decision, session) → answer, e.g. for the testing helper playOut. */
  asAgent(): (decision: Decision, session: GameSession) => Answer {
    return (_decision, session) => this.decide(session);
  }

  private choose(session: GameSession, d: Decision): Answer {
    const me = d.player;
    const view = session.view(me);
    if (view.turn !== this.turn) {
      this.turn = view.turn;
      this.actionsThisTurn = 0;
      this.decisionsThisTurn = 0;
    }
    if (++this.decisionsThisTurn > this.maxDecisionsPerTurn) return defaultAnswer(d);
    const lookup = lookupFromView(view, d, this.engine.db);
    switch (d.type) {
      case "chooseTurnOrder":
        return { type: "chooseTurnOrder", goFirst: this.goFirst };
      case "mulligan":
        return this.mulligan(view, d);
      case "mainPhase":
        if (++this.actionsThisTurn > this.maxActionsPerTurn) return defaultAnswer(d);
        break;
      default:
        break;
    }
    const candidates = candidateAnswers(d, lookup, this.rng, this.maxCandidates);
    // In the main phase every action is compared with ending it (the position as it is now).
    const baseline = d.type === "mainPhase" ? defaultAnswer(d) : null;
    if (baseline ? candidates.length === 0 : candidates.length <= 1) return candidates[0] ?? baseline ?? fastAnswer(d, lookup);
    const seed = `${this.seed}:${this.simulatedDecisions++}`;
    let best: Answer = baseline ?? candidates[0]!;
    let bestValue = baseline ? evaluate(view, me, this.weights) + EPSILON : -Infinity;
    for (const candidate of candidates) {
      const value = this.simulate(session, me, candidate, seed);
      if (value !== null && value > bestValue) {
        best = candidate;
        bestValue = value;
      }
    }
    return best;
  }

  /**
   * Score `answer`: in a sample of the game as `me` knows it (the same sample for every candidate
   * of a decision), give it, play on with quick answers until the next main phase decision (or
   * the step limit), and evaluate. Null when the simulation fails.
   */
  private simulate(session: GameSession, me: PlayerId, answer: Answer, seed: string): number | null {
    this.stats.simulations += 1;
    try {
      const sim = session.determinized(me, seed, { checkpoints: false });
      sim.act(answer);
      const reader = sim.reader();
      for (let steps = 0; sim.decision && sim.decision.type !== "mainPhase" && steps < this.maxSimulationSteps; steps++) {
        sim.act(fastAnswer(sim.decision, lookupFromReader(reader)));
      }
      return evaluate(sim.view(me), me, this.weights);
    } catch (e) {
      this.stats.simulationFailures += 1;
      const message = `${e instanceof Error ? e.name : "Error"}: ${e instanceof Error ? e.message : String(e)}`.slice(0, 300);
      const errors = this.stats.simulationErrors;
      if (message in errors || Object.keys(errors).length < 20) errors[message] = (errors[message] ?? 0) + 1;
      return null;
    }
  }

  /** CR 6.2.1.8 — keep a hand that can be played early, redraw otherwise. */
  private mulligan(view: PlayerView, d: Extract<Decision, { type: "mulligan" }>): Answer {
    const cheap = view.players[d.player].hand.filter((c) => !c.hidden && c.cost !== null && c.cost <= 3).length;
    return cheap >= this.mulliganKeepCheap ? { type: "mulligan", redraw: false } : { type: "mulligan", redraw: true, bottomOrder: [...d.hand] };
  }
}
