import type { Answer, Engine, GameSession } from "./core";
import { GreedyBot } from "./greedy";
import { PlannerBot, type PlannerBotOptions } from "./planner";

/**
 * The bots a player chooses between (docs/bot.md). Easy is the greedy bot (one action at a time). Medium plans its whole
 * turn with what its player can see. Hard plans the same way in the real game, reading every hidden card and the results
 * of future random events: it cheats, on purpose (the project owner's request, 2026-09-30).
 */
export type BotLevel = "easy" | "medium" | "hard";

export const MEDIUM_OPTIONS: PlannerBotOptions = { replyPlans: 4, beamWidth: 6, maxSimulations: 600 };

export const HARD_OPTIONS: PlannerBotOptions = {
  cheat: true,
  replyModel: "planner",
  opponentQuick: true,
  replyPlans: 6,
  beamWidth: 8,
  maxSimulations: 900,
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
  const options = level === "hard" ? HARD_OPTIONS : MEDIUM_OPTIONS;
  const scaled = (n: number | undefined, least: number) => Math.max(least, Math.round((n ?? least) * effort));
  return new PlannerBot(engine, {
    ...options,
    seed,
    maxSimulations: scaled(options.maxSimulations, 100),
    replyPlans: scaled(options.replyPlans, 2),
  });
}
