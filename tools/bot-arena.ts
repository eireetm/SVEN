/**
 * Bots against each other (docs/bot.md): npm run bot:arena -- [games] [a] [b] [options]
 * Levels: easy | medium | hard | medium-beta | hard-beta, and sve-server's AIs imitated (sve-fool, sve-good, sve-planner;
 * tools/sve-server-ais). The sample decks (packages/gui/decks/samples, all but the Cross
 * Craft one), paced as the GUI starts games. Games come in pairs: the same decks and seed with the seats swapped, so neither
 * the decks nor going first favours a bot. Options:
 *   --decks sd01,sd02  only these sample decks (default: all)
 *   --mirror           both players play the same deck (each deck in turn); otherwise different decks are paired
 *   --workers N        play on N processes at once (default 1)
 *   --seed text        another series of games (default "arena")
 * Prints A's wins with a 95% interval, per deck too, and how long each bot thinks: per decision, and per turn of its own.
 */
import { fork } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createEngine, type DeckList } from "../packages/core/src";
import { ALL_CARDS, ALL_SCRIPTS } from "../packages/core/src/sets";
import { BOT_LEVELS, createBot, type BotLevel, type BotStats } from "../packages/bot/src";
import { SVE_SERVER_AIS, createSveServerBot, type SveServerAI } from "./sve-server-ais";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
function option(name: string): string | null {
  const at = args.indexOf(name);
  return at >= 0 ? (args[at + 1] ?? null) : null;
}
const positional = args.filter((arg, i) => !arg.startsWith("--") && !(i > 0 && ["--decks", "--workers", "--seed", "--shard"].includes(args[i - 1]!)));
const games = Number(positional[0] ?? 20);
const names = [positional[1] ?? "medium", positional[2] ?? "easy"];
const LEVELS: readonly string[] = [...BOT_LEVELS, ...SVE_SERVER_AIS];
if (!(games > 0) || !names.every((n) => LEVELS.includes(n))) {
  console.error(`usage: npm run bot:arena -- [games] [${LEVELS.join("|")}] [same] [--decks sd01,sd02] [--mirror] [--workers N] [--seed text]`);
  process.exit(1);
}
const [a, b] = names as [BotLevel | SveServerAI, BotLevel | SveServerAI];
const make = (engine: ReturnType<typeof createEngine>, level: BotLevel | SveServerAI, seed: string) =>
  (SVE_SERVER_AIS as readonly string[]).includes(level) ? createSveServerBot(engine, level as SveServerAI) : createBot(engine, level as BotLevel, seed);
const mirror = flag("--mirror");
const workers = Math.max(1, Number(option("--workers") ?? 1));
const series = option("--seed") ?? "arena";

const dir = join(import.meta.dirname, "..", "packages", "gui", "decks", "samples");
const expand = (counts: Record<string, number> | undefined) => Object.entries(counts ?? {}).flatMap(([id, n]) => Array<string>(n).fill(id));
const wanted = option("--decks")?.split(",").map((d) => d.trim().toLowerCase());
const decks = readdirSync(dir)
  .filter((f) => f.endsWith(".json") && !f.startsWith("cross"))
  .map((f) => f.replace(/\.json$/, ""))
  .filter((name) => !wanted || wanted.includes(name))
  .map((name) => {
    const file = JSON.parse(readFileSync(join(dir, `${name}.json`), "utf8")) as { leader: string; main: Record<string, number>; evolve?: Record<string, number> };
    return { name, deck: { leader: file.leader, main: expand(file.main), evolve: expand(file.evolve) } as DeckList };
  });
if (decks.length === 0) {
  console.error(`no sample deck matches --decks ${option("--decks")}`);
  process.exit(1);
}

/** One game's outcome, as a worker reports it. */
interface GameRecord {
  index: number;
  matchup: string;
  /** "a" / "b": that bot won; "draw"; "?": not finished. */
  winner: "a" | "b" | "draw" | "?";
  turns: number;
  think: Record<"a" | "b", { ms: number; decisions: number; turns: number[] }>;
  /** Answers a bot couldn't give and replaced by the default one, and simulations that failed (both should stay 0). */
  problems: Record<"a" | "b", { fallbacks: number; simulationFailures: number; lastError: string | null }>;
}

/** Game `index`: pair index / 2 decides the decks and the seed; A plays seat index % 2 (the pair swaps the seats). */
function playGame(engine: ReturnType<typeof createEngine>, index: number): GameRecord {
  const pair = Math.floor(index / 2);
  const x = decks[pair % decks.length]!;
  const y = mirror ? x : decks[(pair * 5 + 2) % decks.length]!;
  const seatOfA = index % 2;
  const config = { autoResolve: ["selectPending", "selectCards", "choose", "orderCards"] as const, deckRestrictions: false };
  const game = engine.newGame({ seed: `${series}-${pair}`, players: [x.deck, y.deck], config });
  const bots = [0, 1].map((seat) => (seat === seatOfA ? make(engine, a, `a${pair}`) : make(engine, b, `b${pair}`)));
  const think: GameRecord["think"] = { a: { ms: 0, decisions: 0, turns: [] }, b: { ms: 0, decisions: 0, turns: [] } };
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
  const winner = !result ? "?" : result.winner === null ? "draw" : result.winner === seatOfA ? "a" : "b";
  const statsOf = (seat: number) => {
    const stats = (bots[seat] as { stats?: BotStats }).stats;
    return { fallbacks: stats?.fallbacks ?? 0, simulationFailures: stats?.simulationFailures ?? 0, lastError: stats?.lastError ?? null };
  };
  const problems = { a: statsOf(seatOfA), b: statsOf(1 - seatOfA) };
  return { index, matchup: mirror ? x.name : `${x.name}/${y.name}`, winner, turns: game.state.turn, think, problems };
}

const shard = option("--shard");
if (shard) {
  // A worker: its share of the games, one message each.
  const [k, n] = shard.split("/").map(Number) as [number, number];
  const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });
  for (let i = k; i < games; i += n) process.send!(playGame(engine, i));
  process.exit(0);
}

const records: GameRecord[] = [];
const started = performance.now();
if (workers === 1) {
  const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });
  for (let i = 0; i < games; i++) {
    const r = playGame(engine, i);
    records.push(r);
    process.stdout.write(r.winner === "a" ? "A" : r.winner === "b" ? "B" : r.winner === "draw" ? "=" : "?");
  }
} else {
  await Promise.all(
    Array.from({ length: workers }, (_, k) => {
      const child = fork(process.argv[1]!, [...args, "--shard", `${k}/${workers}`], { stdio: ["ignore", "inherit", "inherit", "ipc"] });
      child.on("message", (r: GameRecord) => {
        records.push(r);
        process.stdout.write(r.winner === "a" ? "A" : r.winner === "b" ? "B" : r.winner === "draw" ? "=" : "?");
      });
      return new Promise<void>((done) => child.on("exit", () => done()));
    }),
  );
}

const pct = (v: number) => `${(100 * v).toFixed(0)}%`;
const interval = (wins: number, losses: number) => {
  const n = wins + losses;
  const p = n > 0 ? wins / n : 0;
  const margin = n > 0 ? 1.96 * Math.sqrt((p * (1 - p)) / n) : 0;
  return `${pct(p)} (95%: ${pct(Math.max(0, p - margin))}–${pct(Math.min(1, p + margin))})`;
};
const count = (rs: GameRecord[], w: GameRecord["winner"]) => rs.filter((r) => r.winner === w).length;
console.log(`\n${a} (A) vs ${b} (B), ${records.length} games${mirror ? ", mirror matches" : ""}, ${((performance.now() - started) / 1000).toFixed(0)} s`);
console.log(`A ${count(records, "a")}, B ${count(records, "b")}, draws ${count(records, "draw")}, unfinished ${count(records, "?")}: A wins ${interval(count(records, "a"), count(records, "b"))} of the decided games`);
const matchups = [...new Set(records.map((r) => r.matchup))].sort();
if (matchups.length > 1) {
  for (const m of matchups) {
    const rs = records.filter((r) => r.matchup === m);
    console.log(`  ${m.padEnd(12)} A ${String(count(rs, "a")).padStart(3)} : ${String(count(rs, "b")).padStart(3)} B  (${pct(count(rs, "a") / Math.max(1, count(rs, "a") + count(rs, "b")))})`);
  }
}
const quantile = (xs: number[], q: number) => [...xs].sort((u, v) => u - v)[Math.min(xs.length - 1, Math.floor(xs.length * q))] ?? 0;
for (const [who, level] of [["a", a], ["b", b]] as const) {
  const ms = records.reduce((s, r) => s + r.think[who].ms, 0);
  const decisions = records.reduce((s, r) => s + r.think[who].decisions, 0);
  const turns = records.flatMap((r) => r.think[who].turns);
  console.log(
    `${who.toUpperCase()} ${level}: ${(ms / Math.max(1, decisions)).toFixed(1)} ms per decision; a turn of its own: median ${quantile(turns, 0.5).toFixed(0)} ms, 90% ${quantile(turns, 0.9).toFixed(0)} ms, longest ${Math.max(0, ...turns).toFixed(0)} ms`,
  );
  const fallbacks = records.reduce((s, r) => s + r.problems[who].fallbacks, 0);
  const failures = records.reduce((s, r) => s + r.problems[who].simulationFailures, 0);
  if (fallbacks + failures > 0) {
    const error = records.map((r) => r.problems[who].lastError).find((e) => e !== null);
    console.log(`  ${who.toUpperCase()} problems: ${fallbacks} default answers, ${failures} failed simulations${error ? `; e.g. ${error}` : ""}`);
  }
}
