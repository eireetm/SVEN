// Bots for the Shadowverse: Evolve engine. They play through the core's public API only: the
// player's view, its decisions and determinized copies of the game (docs/bot.md).

export { GreedyBot, type GreedyBotOptions, type BotStats } from "./greedy";
export { evaluate, DEFAULT_WEIGHTS, type EvalWeights } from "./evaluate";
export { fastAnswer, lookupFromView, lookupFromReader, staticValue, type CardFacts, type CardLookup } from "./policy";
export { candidateAnswers } from "./candidates";
