import { expect, it } from "vitest";
import type { Answer, CardDefinition, DeckList, GameSession, PlayerId } from "../../src";
import { randomInt, seedRng, shuffleInPlace } from "../../src/rng/rng";
import { SETS, type SupportedSet } from "../../src/sets";
import { checkInvariants, playOut, randomAgent, randomAnswer, scenario, type Agent } from "../../src/testing";
import { poolEngine } from "../helpers";

/**
 * Whole-set checks (every card script of one set runs, in random situations):
 *  1. every card is played / evolved / activated in a busy scenario with random choices;
 *  2. random games between random decks built from the set.
 * All invariants are checked after every input, and games must restore identically from a
 * snapshot. The engine holds the whole card pool (later sets reuse earlier tokens).
 */
export function setSmokeTests(set: SupportedSet, opts: { games: number }): void {
  const engine = poolEngine();
  const defs = SETS[set].cards;
  const playable = defs.filter((c) => !c.token && !c.evolved && c.type !== "leader");
  const spells = playable.filter((c) => c.type === "spell");
  const evolvedCards = defs.filter((c) => c.evolved);

  const assertOk = (g: GameSession) => {
    const errors = checkInvariants(g.state as never, engine.db, g.decision);
    if (errors.length > 0) throw new Error(errors.join("\n"));
  };

  /** Answer everything randomly until the next main phase decision (or the end). */
  const settle = (g: GameSession, seed: string) => {
    const rng = seedRng(seed);
    for (let i = 0; i < 200 && g.decision && g.decision.type !== "mainPhase"; i++) {
      g.act(randomAnswer(rng, g.decision));
      assertOk(g);
    }
  };

  const pick = (seed: string, xs: readonly CardDefinition[], n: number) => {
    const rng = seedRng(seed);
    const pool = [...xs];
    shuffleInPlace(rng, pool);
    return pool.slice(0, n).map((c) => c.id);
  };

  it(`${set}: every card can be played, evolved or activated in a busy scenario`, () => {
    const skipped: string[] = [];
    for (const card of defs) {
      if (card.type === "leader") continue;
      const base = card.evolved ? defs.find((d) => d.name === card.name && !d.evolved)! : card;
      const g = scenario(engine, {
        seed: card.id,
        players: [
          {
            // Tokens cannot exist in a hand (CR 9.1.4.1 / 9.1.4.3), so they are played from the EX area.
            hand: card.evolved || card.token ? ["BP01-042"] : [card.id],
            field: [
              ...(card.evolved ? [base.id] : []),
              "BP01-T10", // a Stack amulet for Earth Rite
              "BP01-042",
              { card: "BP01-173", engaged: true },
            ],
            evolveDeck: card.evolved ? [card.id] : [],
            ex: ["BP01-T03", "BP01-T11", ...(card.token ? [card.id] : [])],
            // 10 spells for Spellchain, plus a few other cards for Necrocharge.
            cemetery: [...pick(`${card.id}:spells`, spells, 10), ...pick(`${card.id}:cem`, playable, 6)],
            deck: pick(`${card.id}:deck`, playable, 12),
            playPoints: 10,
            maxPlayPoints: 10,
            evolutionPoints: 2,
            leaderDefense: 12,
          },
          {
            hand: ["BP01-179", "BP01-042"],
            field: ["BP01-146", { card: "BP01-173", engaged: true }, "BP01-138"],
            ex: ["BP01-T05"],
            deck: pick(`${card.id}:opp`, playable, 8),
            playPoints: 3,
          },
        ],
        config: { autoResolve: ["quick"] },
      });
      const d = g.decision;
      if (d?.type !== "mainPhase") throw new Error(`${card.id}: expected a main phase decision`);
      const mine = (id: string) => g.state.cards[id]!.def === card.id || g.state.cards[id]!.def === base.id;
      const action =
        d.actions.find((a) => a.type === "evolve" && mine(a.card)) ??
        d.actions.find((a) => a.type === "play" && mine(a.card)) ??
        d.actions.find((a) => a.type === "activate" && mine(a.card));
      if (!action) skipped.push(card.id);
      else {
        g.act({ type: "mainPhase", action });
        assertOk(g);
        settle(g, card.id);
        // Then use any activated ability of the card that is now available.
        const again = g.decision?.type === "mainPhase" ? g.decision.actions.find((a) => a.type === "activate" && mine(a.card)) : undefined;
        if (again) {
          g.act({ type: "mainPhase", action: again });
          settle(g, `${card.id}:act`);
        }
      }
    }
    expect(skipped).toEqual([]);
  }, 60_000);

  it(`${set}: random games with random decks keep every invariant and replay identically`, () => {
    let finished = 0;
    for (let i = 0; i < opts.games; i++) {
      const deck = (p: PlayerId): DeckList => {
        const rng = seedRng(`${set}-deck-${i}-${p}`);
        const main = Array.from({ length: 40 }, () => playable[randomInt(rng, playable.length)]!.id);
        const evolve = Array.from({ length: 10 }, () => evolvedCards[randomInt(rng, evolvedCards.length)]!.id);
        return { main, evolve };
      };
      const g = engine.newGame({ seed: `${set}-game-${i}`, players: [deck(0), deck(1)], config: { deckRestrictions: false } });
      const agents: [Agent, Agent] = [randomAgent(`${set}x${i}`), randomAgent(`${set}y${i}`)];
      let snapshot: ReturnType<GameSession["snapshot"]> | null = null;
      const later: Answer[] = [];
      let step = 0;
      playOut(g, agents, {
        maxSteps: 4000,
        onStep: (s, answer) => {
          step += 1;
          assertOk(s);
          if (snapshot) later.push(answer);
          else if (step === 30 + i && s.decision) snapshot = JSON.parse(JSON.stringify(s.snapshot()));
        },
      });
      if (g.result) finished += 1;
      if (snapshot) {
        const copy = engine.restore(snapshot);
        for (const a of later) copy.act(a);
        expect(JSON.stringify(copy.state), `game ${i}`).toBe(JSON.stringify(g.state));
      }
    }
    expect(finished).toBe(opts.games);
  }, 120_000);
}
