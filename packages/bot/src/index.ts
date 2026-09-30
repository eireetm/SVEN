// Bots for the Shadowverse: Evolve engine. They play through the core's public API only: the player's view, its
// decisions and copies of the game — determinized ones (what the player knows), or for the hard bot the real game, which
// it reads on purpose (docs/bot.md).

export { GreedyBot, type GreedyBotOptions, type BotStats } from "./greedy";
export { PlannerBot, type PlannerBotOptions } from "./planner";
export { createBot, MEDIUM_OPTIONS, HARD_OPTIONS, type Bot, type BotLevel } from "./levels";
export { evaluate, DEFAULT_WEIGHTS, type EvalWeights } from "./evaluate";
export { fastAnswer, lookupFromView, lookupFromReader, staticValue, type CardFacts, type CardLookup } from "./policy";
export { candidateAnswers } from "./candidates";
