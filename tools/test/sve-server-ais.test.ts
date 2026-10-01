import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createEngine, validateAnswer, type DeckList } from "../../packages/core/src";
import { ALL_CARDS, ALL_SCRIPTS } from "../../packages/core/src/sets";
import { createBot } from "../../packages/bot/src";
import { createSveServerBot, SVE_SERVER_AIS } from "../sve-server-ais";

// sve-server's AIs imitated (tools/sve-server-ais) stay usable as benchmark opponents: each plays a
// whole game against the greedy bot with legal answers, and none of its answers falls back to the default one.
const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });
const expand = (counts: Record<string, number> | undefined) => Object.entries(counts ?? {}).flatMap(([id, n]) => Array<string>(n).fill(id));
const sample = (name: string): DeckList => {
  const file = JSON.parse(readFileSync(join(__dirname, "..", "..", "packages", "gui", "decks", "samples", `${name}.json`), "utf8")) as { leader: string; main: Record<string, number>; evolve?: Record<string, number> };
  return { leader: file.leader, main: expand(file.main), evolve: expand(file.evolve) };
};

describe("sve-server's AIs imitated", () => {
  for (const kind of SVE_SERVER_AIS) {
    it(`${kind} plays a whole game against the greedy bot`, () => {
      const game = engine.newGame({ seed: `sve-${kind}`, players: [sample("sd03"), sample("sd03")], config: { deckRestrictions: false } });
      const bots = [createSveServerBot(engine, kind), createBot(engine, "easy", "easy")];
      for (let i = 0; game.decision && i < 20_000; i++) {
        const d = game.decision;
        const answer = bots[d.player]!.decide(game);
        expect(validateAnswer(d, answer), `${d.type}: ${JSON.stringify(answer)}`).toBeNull();
        game.act(answer);
      }
      expect(game.result).not.toBeNull();
      const stats = (bots[0] as { stats?: { fallbacks: number; lastError: string | null } }).stats;
      expect([stats?.fallbacks ?? 0, stats?.lastError ?? null]).toEqual([0, null]);
    }, 300_000);
  }
});
