import type { Answer, Engine, GameSession } from "./core";
import type { LeaderCurve } from "./evaluate";
import { GreedyBot } from "./greedy";
import { PlannerBot, type PlannerBotOptions } from "./planner";

/**
 * The bots a player chooses between. Easy is the greedy bot (one action at a time). Medium plans its whole
 * turn with what its player can see. Hard plans the same way in the real game, reading every hidden card and the results
 * of future random events: it cheats, on purpose (the project owner's request, 2026-09-30). The beta levels are Medium and
 * Hard with what is being tried next: a lethal search first, a mulligan by the curve, and the leader's
 * defense valued on a curve; `npm run bot:arena` compares them with the others.
 */
export type BotLevel = "easy" | "medium" | "hard" | "medium-beta" | "hard-beta";

export const BOT_LEVELS: readonly BotLevel[] = ["easy", "medium", "hard", "medium-beta", "hard-beta"];

export const MEDIUM_OPTIONS: PlannerBotOptions = { replyPlans: 4, beamWidth: 6, maxSimulations: 600 };

export const HARD_OPTIONS: PlannerBotOptions = {
  cheat: true,
  replyModel: "planner",
  opponentQuick: true,
  replyPlans: 6,
  beamWidth: 8,
  maxSimulations: 900,
};

/**
 * The beta bots' leader curve (evaluate.ts): the n-th point of defense is worth `base + extra · e^(−(n−1)/scale)` with the
 * values below — about 2.5 for the last point, 1.1 at 10, 0.8 at 20 (a follower's attack point is 1) — counted after half
 * the attack the other side could deal.
 */
export const LEADER_CURVE: LeaderCurve = { base: 0.7, extra: 1.8, scale: 6, threat: 0.5 };

export const MEDIUM_BETA_OPTIONS: PlannerBotOptions = { ...MEDIUM_OPTIONS, lethalSearch: 300, mulligan: "curve", weights: { leaderCurve: LEADER_CURVE } };

export const HARD_BETA_OPTIONS: PlannerBotOptions = { ...HARD_OPTIONS, lethalSearch: 500, mulligan: "curve", weights: { leaderCurve: LEADER_CURVE } };

const PLANNER_OPTIONS: Record<Exclude<BotLevel, "easy">, PlannerBotOptions> = {
  medium: MEDIUM_OPTIONS,
  hard: HARD_OPTIONS,
  "medium-beta": MEDIUM_BETA_OPTIONS,
  "hard-beta": HARD_BETA_OPTIONS,
};

export interface Bot {
  decide(session: GameSession): Answer;
}

/**
 * A bot of a level. `effort` scales how much the planners search, for a slower device (a phone: less); it changes how
 * long they think, not what they know. The same seed and effort give the same answers.
 */
export function createBot(engine: Engine, level: BotLevel, seed: string, effort = 1): Bot {
  if (level === "easy") return new GreedyBot(engine, { seed });
  const options = PLANNER_OPTIONS[level];
  const scaled = (n: number | undefined, least: number) => Math.max(least, Math.round((n ?? least) * effort));
  return new PlannerBot(engine, {
    ...options,
    seed,
    maxSimulations: scaled(options.maxSimulations, 100),
    replyPlans: scaled(options.replyPlans, 2),
    ...(options.lethalSearch ? { lethalSearch: scaled(options.lethalSearch, 100) } : {}),
  });
}
