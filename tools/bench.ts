/**
 * Engine and bot speed (npm run bench [games]): random games, copying a game, and the greedy bot.
 * Decks are random from every supported set. For spotting performance regressions; the numbers
 * depend on the machine, so compare runs on the same one (docs/bot.md has reference numbers).
 */
import { createEngine } from "../packages/core/src";
import { ALL_CARDS, ALL_SCRIPTS } from "../packages/core/src/sets";
import { deckPool, playOut, randomAgent, randomDeck } from "../packages/core/src/testing";
import { GreedyBot } from "../packages/bot/src";

const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });
const pool = deckPool(engine);
const games = Number(process.argv[2] ?? 200);
const newGame = (seed: string, checkpoints = true) =>
  engine.newGame({ seed, players: [randomDeck(pool, `${seed}/0`), randomDeck(pool, `${seed}/1`)], config: { deckRestrictions: false } }, { checkpoints });

function time<T>(f: () => T): [T, number] {
  const t0 = performance.now();
  const result = f();
  return [result, performance.now() - t0];
}

// 1. Random games without checkpoints (what a bot's playouts cost).
const [inputs, randomMs] = time(() => {
  let n = 0;
  for (let i = 0; i < games; i++) n += playOut(newGame(`bench-${i}`, false), [randomAgent(`a${i}`), randomAgent(`b${i}`)]);
  return n;
});
console.log(`random games: ${(randomMs / games).toFixed(2)} ms/game, ${((randomMs / inputs) * 1000).toFixed(0)} µs/input`);

// 2. Copying a game at a main phase decision (clone) and sampling it for a player (determinized).
const mid = newGame("bench-copy");
playOut(mid, [randomAgent("c0"), randomAgent("c1")], { maxSteps: 60 });
while (mid.decision && mid.decision.type !== "mainPhase") playOut(mid, [randomAgent("c2"), randomAgent("c3")], { maxSteps: 1 });
if (mid.decision) {
  const [, cloneMs] = time(() => {
    for (let i = 0; i < 1000; i++) mid.clone({ checkpoints: false });
  });
  const [, detMs] = time(() => {
    for (let i = 0; i < 1000; i++) mid.determinized(mid.decision!.player, i, { checkpoints: false });
  });
  console.log(`clone: ${cloneMs.toFixed(0)} µs, determinized: ${detMs.toFixed(0)} µs (per copy, ${JSON.stringify(mid.state).length >> 10} KB state)`);
}

// 3. The greedy bot against itself.
const botGames = Math.max(1, Math.floor(games / 10));
const [decisions, botMs] = time(() => {
  let n = 0;
  for (let i = 0; i < botGames; i++) {
    const bots = [new GreedyBot(engine, { seed: `x${i}` }), new GreedyBot(engine, { seed: `y${i}` })];
    const g = newGame(`bench-bot-${i}`);
    while (g.decision) g.act(bots[g.decision.player]!.decide(g));
    n += bots[0]!.stats.decisions + bots[1]!.stats.decisions;
  }
  return n;
});
console.log(`greedy bot vs itself: ${(botMs / botGames).toFixed(0)} ms/game, ${(botMs / decisions).toFixed(2)} ms/decision`);
