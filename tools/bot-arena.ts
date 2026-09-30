/**
 * Bots against each other (npm run bot:arena -- [games] [a] [b]; levels easy | medium | hard, docs/bot.md). The sample
 * decks (packages/gui/decks/samples, all but the Cross Craft one), paced as the GUI starts games. Games come in pairs:
 * the same decks and seed with the seats swapped, so neither the decks nor going first favours a bot. Prints the wins
 * with a 95% interval, and how long each bot thinks: per decision, and per turn of its own (all its decisions in it).
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createEngine, type DeckList } from "../packages/core/src";
import { ALL_CARDS, ALL_SCRIPTS } from "../packages/core/src/sets";
import { createBot, type BotLevel } from "../packages/bot/src";

const LEVELS: readonly string[] = ["easy", "medium", "hard"];
const games = Number(process.argv[2] ?? 20);
const names = [process.argv[3] ?? "medium", process.argv[4] ?? "easy"] as const;
if (!(games > 0) || !names.every((n) => LEVELS.includes(n))) {
  console.error("usage: npm run bot:arena -- [games] [easy|medium|hard] [easy|medium|hard]");
  process.exit(1);
}
const [a, b] = names as unknown as [BotLevel, BotLevel];

const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });
const dir = join(import.meta.dirname, "..", "packages", "gui", "decks", "samples");
const expand = (counts: Record<string, number> | undefined) => Object.entries(counts ?? {}).flatMap(([id, n]) => Array<string>(n).fill(id));
const decks = readdirSync(dir)
  .filter((f) => f.endsWith(".json") && !f.startsWith("cross"))
  .map((f) => {
    const file = JSON.parse(readFileSync(join(dir, f), "utf8")) as { leader: string; main: Record<string, number>; evolve?: Record<string, number> };
    return { name: f.replace(/\.json$/, ""), deck: { leader: file.leader, main: expand(file.main), evolve: expand(file.evolve) } as DeckList };
  });
// As the setup screen starts games: every main phase and quick window is asked (game-host.ts configOf).
const config = { autoResolve: ["selectPending", "selectCards", "choose", "orderCards"] as const, deckRestrictions: false };

const wins = { a: 0, b: 0, draws: 0, unfinished: 0 };
const think = { a: { ms: 0, decisions: 0, turns: [] as number[] }, b: { ms: 0, decisions: 0, turns: [] as number[] } };
for (let i = 0; i < games; i++) {
  const pair = Math.floor(i / 2);
  const x = decks[pair % decks.length]!;
  const y = decks[(pair * 5 + 2) % decks.length]!;
  const seatOfA = i % 2;
  const game = engine.newGame({ seed: `arena-${pair}`, players: [x.deck, y.deck], config });
  const bots = [0, 1].map((seat) => (seat === seatOfA ? createBot(engine, a, `a${pair}`) : createBot(engine, b, `b${pair}`)));
  let turn = { number: -1, ms: 0, who: "a" as "a" | "b" };
  for (let steps = 0; game.decision && steps < 5000; steps++) {
    const player = game.decision.player;
    const who = player === seatOfA ? "a" : "b";
    const t0 = performance.now();
    const answer = bots[player]!.decide(game);
    const ms = performance.now() - t0;
    think[who].ms += ms;
    think[who].decisions += 1;
    if (game.state.activePlayer === player) {
      if (turn.number !== game.state.turn) {
        if (turn.number >= 0) think[turn.who].turns.push(turn.ms);
        turn = { number: game.state.turn, ms: 0, who };
      }
      turn.ms += ms;
    }
    game.act(answer);
  }
  const result = game.result;
  if (!result) wins.unfinished += 1;
  else if (result.winner === null) wins.draws += 1;
  else if (result.winner === seatOfA) wins.a += 1;
  else wins.b += 1;
  process.stdout.write(`${!result ? "?" : result.winner === null ? "=" : result.winner === seatOfA ? "A" : "B"}`);
}

const decided = wins.a + wins.b;
const p = decided > 0 ? wins.a / decided : 0;
const margin = decided > 0 ? 1.96 * Math.sqrt((p * (1 - p)) / decided) : 0;
const pct = (v: number) => `${(100 * v).toFixed(0)}%`;
console.log(`\n${a} (A) vs ${b} (B), ${games} games: A ${wins.a}, B ${wins.b}, draws ${wins.draws}, unfinished ${wins.unfinished}`);
console.log(`A wins ${pct(p)} of the decided games (95%: ${pct(Math.max(0, p - margin))}–${pct(Math.min(1, p + margin))})`);
const quantile = (xs: number[], q: number) => [...xs].sort((u, v) => u - v)[Math.min(xs.length - 1, Math.floor(xs.length * q))] ?? 0;
for (const [who, level] of [["a", a], ["b", b]] as const) {
  const t = think[who];
  console.log(
    `${who.toUpperCase()} ${level}: ${(t.ms / Math.max(1, t.decisions)).toFixed(1)} ms per decision; a turn of its own: median ${quantile(t.turns, 0.5).toFixed(0)} ms, 90% ${quantile(t.turns, 0.9).toFixed(0)} ms, longest ${Math.max(0, ...t.turns).toFixed(0)} ms`,
  );
}
