import {
  defaultAnswer,
  opponentOf,
  seedRng,
  validateAnswer,
  type Answer,
  type CardId,
  type Decision,
  type Engine,
  type GameSession,
  type MainAction,
  type PlayerId,
  type PlayerView,
  type RngState,
} from "./core";
import { candidateAnswers } from "./candidates";
import { DEFAULT_WEIGHTS, evaluate, type EvalWeights } from "./evaluate";
import { GreedyBot, type BotStats } from "./greedy";
import { redrawByExpectation, redrawKnowingDeck } from "./mulligan";
import { fastAnswer, lookupFromReader, type CardLookup } from "./policy";

export interface PlannerBotOptions {
  seed?: string | number;
  /**
   * Plan in the real game: every hidden card (the opponent's hand, both decks in order) and every future random result.
   * The hard bot cheats on purpose (the project owner's request); the others plan in samples of what their player knows.
   */
  cheat?: boolean;
  weights?: Partial<EvalWeights>;
  /** Plans kept at each step of the search. */
  beamWidth?: number;
  /** Answers tried at each decision of a plan. */
  maxBranches?: number;
  /** Most decisions in one plan. */
  maxDepth?: number;
  /** How many of the best plans are scored again after a simulated turn of the opponent. */
  replyPlans?: number;
  /** Most answers tried while searching one plan (a count, not a time: the same game gives the same plan). */
  maxSimulations?: number;
  /** Who plays the opponent's next turn when plans are scored after it: the greedy bot, or a smaller planner. */
  replyModel?: "greedy" | "planner";
  /** During our turn the opponent's quick windows are answered by the greedy bot instead of passing (for a bot that knows their hand). */
  opponentQuick?: boolean;
  /** Main phase actions per turn; after that the bot ends its main phase (CR 15.2.1.1: the player decides how often they repeat). */
  maxActionsPerTurn?: number;
  /** Decisions per turn in its main phase; after that it gives default answers, which stop any cycle it can stop. */
  maxDecisionsPerTurn?: number;
  /**
   * Before planning a turn, look for lethal with this many answers at most (0: don't): a search that ranks positions only by
   * the defense the opponent's leader keeps if every attack on it we could declare now lands (docs/bot.md, the beta bots).
   */
  lethalSearch?: number;
  /** "curve": keep or redraw by the curve of the first turns (mulligan.ts); "greedy" (default): the greedy bot's rule. */
  mulligan?: "greedy" | "curve";
}

/** A point of a plan: a copy of the game at one of our decisions in our main phase, or where the plan ends. */
interface Node {
  session: GameSession;
  parent: Node | null;
  /** The answer that led here from the parent. */
  answer: Answer | null;
  depth: number;
  /** The position scored as it stands (the search's ranking). */
  value: number;
  /** The face damage our attacks declarable now could deal (at a choice inside an action: as at its parent). */
  reach: number;
  /** The lethal search's ranking: the opponent's leader defense left once that damage lands (lower first), then its defense. */
  lethal: number;
  /** The game ended, or our turn did: nothing left to plan. */
  done: boolean;
  key: string;
}

type Stop = "decide" | "turnOver" | "gameOver";

/**
 * A bot that plans its whole turn (docs/bot.md): at a decision in its main phase it searches sequences of its answers
 * (plays, evolves, abilities, attacks, and the choices they ask for) with a beam search, scoring every plan at the same
 * point — its turn ended there — then plays the opponent's next turn after the best few plans and keeps the one that holds
 * up best. It plays the first answer of that plan and plans again at its next decision. Decisions outside its main phase
 * (quick windows in the opponent's turn, the end phase, mulligan) are the greedy bot's.
 */
export class PlannerBot {
  readonly stats: BotStats = { decisions: 0, simulations: 0, simulationFailures: 0, simulationErrors: {}, fallbacks: 0, lastError: null };
  private readonly weights: EvalWeights;
  private readonly seed: string;
  private readonly cheat: boolean;
  private readonly beamWidth: number;
  private readonly maxBranches: number;
  private readonly maxDepth: number;
  private readonly replyPlans: number;
  private readonly maxSimulations: number;
  private readonly maxActionsPerTurn: number;
  private readonly maxDecisionsPerTurn: number;
  private readonly rng: RngState;
  private readonly replyModel: "greedy" | "planner";
  private readonly opponentQuick: boolean;
  private readonly lethalSearch: number;
  private readonly mulliganMode: "greedy" | "curve";
  private readonly greedy: GreedyBot;
  private plans = 0;
  /** Opponent models made so far (each simulation gets a fresh one: the greedy bot counts actions per turn). */
  private models = 0;
  private turn = -1;
  private actionsThisTurn = 0;
  private decisionsThisTurn = 0;
  /** The plan being carried out: its positions from the first answer on, and how many answers of it were given. */
  private current: { path: Node[]; given: number; turn: number } | null = null;

  constructor(
    private readonly engine: Engine,
    options: PlannerBotOptions = {},
  ) {
    this.weights = { ...DEFAULT_WEIGHTS, ...options.weights, keywords: { ...DEFAULT_WEIGHTS.keywords, ...options.weights?.keywords } };
    this.seed = String(options.seed ?? "planner");
    this.cheat = options.cheat ?? false;
    this.beamWidth = options.beamWidth ?? 6;
    this.maxBranches = options.maxBranches ?? 16;
    this.maxDepth = options.maxDepth ?? 10;
    this.replyPlans = options.replyPlans ?? 4;
    this.maxSimulations = options.maxSimulations ?? 600;
    this.maxActionsPerTurn = options.maxActionsPerTurn ?? 40;
    this.maxDecisionsPerTurn = options.maxDecisionsPerTurn ?? 300;
    this.rng = seedRng(`planner:${this.seed}`);
    this.replyModel = options.replyModel ?? "greedy";
    this.opponentQuick = options.opponentQuick ?? false;
    this.lethalSearch = options.lethalSearch ?? 0;
    this.mulliganMode = options.mulligan ?? "greedy";
    this.greedy = new GreedyBot(engine, { seed: `${this.seed}:greedy` });
  }

  decide(session: GameSession): Answer {
    const d = session.decision;
    if (!d) throw new Error("PlannerBot.decide: the game isn't waiting for a decision");
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

  asAgent(): (decision: Decision, session: GameSession) => Answer {
    return (_decision, session) => this.decide(session);
  }

  private choose(session: GameSession, d: Decision): Answer {
    const me = d.player;
    const state = session.state;
    if (d.type === "mulligan" && this.mulliganMode === "curve") return this.mulligan(session, d);
    if (state.activePlayer !== me || state.phase !== "main" || d.type === "chooseTurnOrder" || d.type === "mulligan") return this.greedy.decide(session);
    if (state.turn !== this.turn) {
      this.turn = state.turn;
      this.actionsThisTurn = 0;
      this.decisionsThisTurn = 0;
    }
    if (++this.decisionsThisTurn > this.maxDecisionsPerTurn) return defaultAnswer(d);
    if (d.type === "mainPhase" && ++this.actionsThisTurn > this.maxActionsPerTurn) return defaultAnswer(d);
    return this.followPlan(session, me) ?? this.plan(session, me);
  }

  /**
   * The next answer of the current plan, if the game is where the plan expected it to be (the same view: nothing hidden
   * turned out differently, the opponent answered as expected). Null: plan again.
   */
  private followPlan(game: GameSession, me: PlayerId): Answer | null {
    const plan = this.current;
    if (!plan || plan.turn !== game.state.turn || plan.given === 0) return null;
    if (plan.path[plan.given - 1]!.key !== JSON.stringify(game.view(me))) return null;
    const next = plan.given < plan.path.length ? plan.path[plan.given]!.answer! : canEnd(game.decision!) ? endMainPhase() : null;
    if (!next || validateAnswer(game.decision!, next) !== null) return null;
    plan.given += 1;
    return next;
  }

  /** The first answer of the best plan for the rest of this turn. */
  private plan(game: GameSession, me: PlayerId): Answer {
    const turn = game.state.turn;
    const seed = `${this.seed}:${this.plans++}`;
    const world = () => (this.cheat ? game.clone() : game.determinized(me, seed));
    const root = this.node(world(), null, null, me, turn, "decide");
    if (this.lethalSearch > 0 && root.session.decision?.type === "mainPhase") {
      const lethal = this.findLethal(root, me, turn, world);
      if (lethal) return this.carryOut(lethal, turn);
    }
    const finished: Node[] = [];
    const seen = new Set<string>([root.key]);
    let frontier = [root];
    let budget = this.maxSimulations;
    for (let depth = 0; depth < this.maxDepth && frontier.length > 0 && budget > 0; depth++) {
      const children: Node[] = [];
      for (const node of frontier) {
        const d = node.session.decision!;
        if (canEnd(d)) finished.push(node);
        for (const answer of this.branches(d, lookupFromReader(node.session.reader()))) {
          if (budget-- <= 0) break;
          const child = this.expand(node, answer, me, turn, world);
          if (!child) continue;
          if (child.done) finished.push(child);
          else if (!seen.has(child.key)) {
            seen.add(child.key);
            children.push(child);
          }
        }
      }
      children.sort((a, b) => b.value - a.value);
      frontier = children.slice(0, this.beamWidth);
    }
    for (const node of frontier) if (canEnd(node.session.decision!)) finished.push(node);
    if (finished.length === 0) return fastAnswer(game.decision!, lookupFromReader(game.reader()));
    // The best plans by the position they leave, then by the position after the opponent's reply.
    finished.sort((a, b) => b.value - a.value);
    const best = new Map<string, Node>();
    for (const node of finished) if (!best.has(node.key) && best.size < this.replyPlans) best.set(node.key, node);
    let choice: Node = finished[0]!;
    let choiceValue = -Infinity;
    for (const node of this.replyPlans > 0 ? best.values() : []) {
      const value = node.done ? node.value : this.afterReply(node, me, turn, world);
      if (value > choiceValue) {
        choice = node;
        choiceValue = value;
      }
    }
    return this.carryOut(choice, turn);
  }

  /** Take the plan that ends at `choice` as the current one: its first answer now, the next ones while the game goes as planned. */
  private carryOut(choice: Node, turn: number): Answer {
    const path: Node[] = [];
    for (let n: Node | null = choice; n && n.parent; n = n.parent) path.unshift(n);
    this.current = { path, given: path.length > 0 ? 1 : 0, turn };
    return path[0]?.answer ?? endMainPhase();
  }

  /**
   * Lethal first (the beta bots, docs/bot.md): a beam search over this turn's answers ranked by the defense the opponent's
   * leader keeps once every attack on it we could declare now lands. A play that only opens the way (a Ward taken out, a
   * Storm follower played, an attacker made stronger) ranks high, which the normal search, ranking whole positions, may not
   * see in time. Searched only when lethal is within reach; returns a plan that wins the game, or null.
   */
  private findLethal(root: Node, me: PlayerId, turn: number, world: () => GameSession): Node | null {
    if (!lethalWithinReach(root, me)) return null;
    const seen = new Set<string>([root.key]);
    let frontier = [root];
    let budget = this.lethalSearch;
    for (let depth = 0; depth < 16 && frontier.length > 0 && budget > 0; depth++) {
      const children: Node[] = [];
      for (const node of frontier) {
        for (const answer of this.branches(node.session.decision!, lookupFromReader(node.session.reader()))) {
          if (budget-- <= 0) break;
          const child = this.expand(node, answer, me, turn, world);
          if (!child) continue;
          if (child.done) {
            if (child.session.result?.winner === me) return child;
          } else if (!seen.has(child.key)) {
            seen.add(child.key);
            children.push(child);
          }
        }
      }
      children.sort((a, b) => a.lethal - b.lethal);
      frontier = children.slice(0, Math.max(8, this.beamWidth));
    }
    return null;
  }

  /**
   * CR 6.2.1.8: keep or redraw by the curve of the first four turns (mulligan.ts). A cheating bot knows the deck's order, so
   * it compares the hand with the four cards on top; a fair one compares with what the rest of its deck list gives on average
   * (the cards of its own deck, which a player knows, not their order).
   */
  private mulligan(game: GameSession, d: Extract<Decision, { type: "mulligan" }>): Answer {
    const me = d.player;
    const reader = game.reader();
    const cost = (id: CardId) => Math.max(0, reader.info(id).cost ?? 0);
    const hand = d.hand.map(cost);
    const deck = reader.cards(me, "deck").map(cost);
    const first = game.state.firstPlayer === me;
    const redraw = this.cheat ? redrawKnowingDeck(hand, deck, first) : redrawByExpectation(hand, deck.sort((a, b) => a - b), first, this.rng);
    return redraw ? { type: "mulligan", redraw: true, bottomOrder: [...d.hand] } : { type: "mulligan", redraw: false };
  }

  /** The answers worth trying at a decision of a plan: main phase actions by kind in turns, the rest as the greedy bot does. */
  private branches(d: Decision, lookup: CardLookup): Answer[] {
    if (d.type !== "mainPhase") return candidateAnswers(d, lookup, this.rng, this.maxBranches);
    const groups: Record<string, { key: string; answer: Answer }[]> = { attack: [], play: [], evolve: [], activate: [] };
    const seen = new Set<string>();
    for (const action of d.actions) {
      if (action.type === "endMainPhase" || action.type === "manual") continue;
      const key = actionKey(action, lookup);
      if (seen.has(key)) continue;
      seen.add(key);
      groups[action.type]!.push({ key, answer: { type: "mainPhase", action } });
    }
    // Attacks on the leader first, then on the most valuable followers.
    groups.attack!.sort((a, b) => targetRank(b.answer, lookup) - targetRank(a.answer, lookup));
    const out: Answer[] = [];
    const lists = Object.values(groups);
    for (let i = 0; out.length < this.maxBranches && lists.some((l) => i < l.length); i++) {
      for (const list of lists) if (i < list.length && out.length < this.maxBranches) out.push(list[i]!.answer);
    }
    return out;
  }

  /** Give `answer` in a copy of `node` and play on to our next decision (the opponent passes in their quick windows). */
  private expand(node: Node, answer: Answer, me: PlayerId, turn: number, world: () => GameSession): Node | null {
    this.stats.simulations += 1;
    try {
      const session = this.copy(node, world);
      session.act(answer);
      const stop = this.advance(session, me, turn);
      return this.node(session, node, answer, me, turn, stop);
    } catch (e) {
      this.stats.simulationFailures += 1;
      const message = `${e instanceof Error ? e.name : "Error"}: ${e instanceof Error ? e.message : String(e)}`.slice(0, 300);
      const errors = this.stats.simulationErrors;
      if (message in errors || Object.keys(errors).length < 20) errors[message] = (errors[message] ?? 0) + 1;
      return null;
    }
  }

  /**
   * A fresh copy of a node's game. A sample made in the middle of an action can't be copied until its next main phase
   * (GameSession.determinized), so such a node is rebuilt from its parent.
   */
  private copy(node: Node, world: () => GameSession): GameSession {
    if (node.parent === null) return world();
    try {
      return node.session.clone();
    } catch {
      const session = this.copy(node.parent, world);
      session.act(node.answer!);
      this.advance(session, node.session.decision!.player, node.session.state.turn);
      return session;
    }
  }

  /** Answer the decisions that aren't ours to plan (the opponent's quick windows) until we decide again. */
  private advance(session: GameSession, me: PlayerId, turn: number): Stop {
    for (let steps = 0; steps < 300; steps++) {
      const d = session.decision;
      if (!d) return "gameOver";
      if (session.state.turn !== turn || session.state.phase !== "main") return "turnOver";
      if (d.player === me) return "decide";
      session.act(this.opponentQuick && d.type === "quick" ? this.model("greedy").decide(session) : fastAnswer(d, lookupFromReader(session.reader())));
    }
    return "turnOver";
  }

  private node(session: GameSession, parent: Node | null, answer: Answer | null, me: PlayerId, turn: number, stop: Stop): Node {
    const view = session.view(me);
    const decision = session.decision;
    const reach = decision?.type === "mainPhase" && decision.player === me ? faceReach(view, decision, me) : (parent?.reach ?? 0);
    const defense = view.players[opponentOf(me)].leaderDefense;
    return {
      session,
      parent,
      answer,
      depth: parent ? parent.depth + 1 : 0,
      value: evaluate(view, me, this.weights),
      reach,
      lethal: (defense - reach) * 10 + defense,
      done: stop !== "decide",
      key: JSON.stringify(view),
    };
  }

  /** A fresh model of the opponent (a fair one: it plans with what the opponent can see). */
  private model(kind: "greedy" | "planner"): { decide(session: GameSession): Answer } {
    const seed = `${this.seed}:model:${this.models++}`;
    return kind === "planner"
      ? new PlannerBot(this.engine, { seed, replyPlans: 0, beamWidth: 4, maxBranches: 12, maxSimulations: 150 })
      : new GreedyBot(this.engine, { seed, maxCandidates: 12 });
  }

  /** The position at our next main phase after ending the turn at `node` and the opponent's turn (played by a model). */
  private afterReply(node: Node, me: PlayerId, turn: number, world: () => GameSession): number {
    this.stats.simulations += 1;
    try {
      const session = this.copy(node, world);
      const opponent = this.model(this.replyModel);
      session.act(endMainPhase());
      for (let steps = 0; steps < 3000; steps++) {
        const d = session.decision;
        if (!d || (d.player === me && d.type === "mainPhase" && session.state.turn > turn)) break;
        session.act(d.player === me ? fastAnswer(d, lookupFromReader(session.reader())) : opponent.decide(session));
      }
      return evaluate(session.view(me), me, this.weights);
    } catch (e) {
      this.stats.simulationFailures += 1;
      this.stats.lastError = e instanceof Error ? e.message : String(e);
      return node.value - 1_000;
    }
  }
}

/** The face damage of the attacks on the opponent's leader that can be declared at this main phase decision (each attacker once). */
function faceReach(view: PlayerView, d: Extract<Decision, { type: "mainPhase" }>, me: PlayerId): number {
  const leader = view.players[opponentOf(me)].leader?.id;
  const attackers = new Set<CardId>();
  for (const a of d.actions) if (a.type === "attack" && a.target === leader) attackers.add(a.attacker);
  let sum = 0;
  for (const card of view.players[me].field) if (!card.hidden && attackers.has(card.id)) sum += Math.max(0, card.attack ?? 0);
  return sum;
}

/**
 * Is lethal worth searching for? The opponent's defense is low, or at most the face damage we can declare now, plus the
 * attack of the Storm followers we could play (CR 12.9.2), plus a margin for what spells, evolutions and abilities may add.
 */
function lethalWithinReach(root: Node, me: PlayerId): boolean {
  const view = root.session.view(me);
  const side = view.players[me];
  let storm = 0;
  for (const card of side.hand) {
    if (!card.hidden && card.type === "follower" && card.keywords.includes("storm") && (card.cost ?? 99) <= side.playPoints) storm += Math.max(0, card.attack ?? 0);
  }
  const defense = view.players[opponentOf(me)].leaderDefense;
  return defense <= 10 || defense <= root.reach + storm + 6;
}

function canEnd(d: Decision): boolean {
  return d.type === "mainPhase" && d.actions.some((a) => a.type === "endMainPhase");
}

function endMainPhase(): Answer {
  return { type: "mainPhase", action: { type: "endMainPhase" } };
}

/** Actions that give the same position: the same card played from the same place, attacks by identical followers. */
function actionKey(action: MainAction, lookup: CardLookup): string {
  switch (action.type) {
    case "play": {
      const f = lookup(action.card);
      return f ? `play|${f.def}|${f.zone}|${String(f.cost)}` : JSON.stringify(action);
    }
    case "evolve": {
      const f = lookup(action.evolveCard);
      return JSON.stringify({ ...action, evolveCard: f?.def ?? action.evolveCard });
    }
    case "attack": {
      const a = lookup(action.attacker);
      return a ? `attack|${a.def}|${a.value}|${a.zone}|${action.target}` : JSON.stringify(action);
    }
    default:
      return JSON.stringify(action);
  }
}

function targetRank(answer: Answer, lookup: CardLookup): number {
  if (answer.type !== "mainPhase" || answer.action.type !== "attack") return 0;
  const target = lookup(answer.action.target);
  return target?.zone === "leader" ? 1_000 : (target?.value ?? 0);
}
