import { describe, expect, it } from "vitest";
import { ALL_AUTO_RESOLVABLE, IMPLEMENTED_KEYWORDS, randomAnswer, randomInt, seedRng, type CardId, type ManualDestination, type ManualOp, type PlayerId, type RngState } from "../../src";
import type { GameSession } from "../../src/engine/session";
import { checkInvariants, deckPool, randomDeck } from "../../src/testing";
import { poolEngine } from "../helpers";

// Manual operations at random (model/manual.ts) in random games of the whole card pool: they make states the rules never
// make (followers attacking again, cards moved anywhere, free plays and evolutions ...). The engine must carry every one of
// them out without failing and keep its invariants; the scripts must cope. MANUAL_FUZZ_GAMES=300 plays more games.

const engine = poolEngine();
const pool = deckPool(engine);
const GAMES = Number(process.env.MANUAL_FUZZ_GAMES ?? 10);
const DESTINATIONS: ManualDestination[] = ["hand", "field", "ex", "cemetery", "banished", "deckTop", "deckBottom"];

function pick<T>(rng: RngState, xs: readonly T[]): T | undefined {
  return xs.length > 0 ? xs[randomInt(rng, xs.length)] : undefined;
}

/** A random manual operation on the game as it is (it may not be allowed: the session says so). */
function randomOp(g: GameSession, rng: RngState): ManualOp | null {
  const s = g.state;
  const p = randomInt(rng, 2) as PlayerId;
  const zone = (z: "hand" | "field" | "ex" | "cemetery" | "banished") => [...s.players[0].zones[z], ...s.players[1].zones[z]];
  const options = g.manualOptions()!;
  const onField = zone("field");
  const card = (xs: readonly CardId[]) => pick(rng, xs);
  switch (randomInt(rng, 16)) {
    case 0:
      return { kind: "draw", player: p, count: 1 + randomInt(rng, 2) };
    case 1:
      return { kind: "mill", player: p, count: 1 };
    case 2:
      return { kind: "points", player: p, playPoints: randomInt(rng, 11), maxPlayPoints: randomInt(rng, 11), evolutionPoints: randomInt(rng, 4) };
    case 3: {
      const c = card([...zone("hand"), ...onField, ...zone("ex"), ...zone("cemetery"), ...zone("banished")]);
      return c ? { kind: "move", card: c, to: pick(rng, DESTINATIONS)! } : null;
    }
    case 4: {
      const c = card(onField);
      return c ? { kind: "destroy", card: c } : null;
    }
    case 5: {
      const c = card(onField);
      return c ? { kind: "engage", card: c, engaged: randomInt(rng, 2) === 0 } : null;
    }
    case 6: {
      const c = card(onField);
      return c ? { kind: "damage", card: c, amount: 1 + randomInt(rng, 3) } : null;
    }
    case 7: {
      const c = card(onField);
      return c ? { kind: "stats", card: c, attack: randomInt(rng, 3) - 1, defense: 1 + randomInt(rng, 2) } : null;
    }
    case 8: {
      const c = card(onField);
      return c ? { kind: "keyword", card: c, keyword: pick(rng, IMPLEMENTED_KEYWORDS)! } : null;
    }
    case 9: {
      const c = card([...onField, ...zone("ex")]);
      return c ? { kind: "counters", card: c, counter: pick(rng, ["stack", "fable", "spell"])!, amount: randomInt(rng, 2) === 0 ? 1 : -1 } : null;
    }
    case 10: {
      const c = card(Object.keys(options.evolveWith));
      const o = c ? pick(rng, options.evolveWith[c]!) : undefined;
      return c && o ? { kind: "evolve", card: c, evolveCard: o.card, superEvolve: randomInt(rng, 2) === 0, ...(o.backFace ? { backFace: true } : {}) } : null;
    }
    case 11:
    case 12: {
      const active = s.activePlayer;
      const attacker = card(s.players[active].zones.field);
      const enemy = s.players[active === 0 ? 1 : 0].zones;
      const target = card([...enemy.field, ...enemy.leader]);
      return attacker && target ? { kind: "attack", attacker, target } : null;
    }
    case 13: {
      const c = card(options.playable);
      return c ? { kind: "play", card: c } : null;
    }
    case 14: {
      const key = card(options.activatable);
      return key ? { kind: "activate", card: key.split(":")[0]!, ability: Number(key.split(":")[1]) } : null;
    }
    default:
      return { kind: "leaderDefense", player: p, value: s.players[p].leaderDefense + randomInt(rng, 7) - 3 };
  }
}

describe("manual operations at random", () => {
  for (let game = 0; game < GAMES; game++) {
    it(`game ${game + 1}: every operation is carried out, the invariants hold, the game goes on`, () => {
      const seed = `manual-fuzz-${game}`;
      const rng = seedRng(seed);
      const g = engine.newGame({
        seed,
        players: [randomDeck(pool, `${seed}:a`), randomDeck(pool, `${seed}:b`)],
        config: { deckRestrictions: false, manualActions: true, autoResolve: ALL_AUTO_RESOLVABLE.filter((t) => t !== "mainPhase") },
      });
      let manualOps = 0;
      for (let step = 0; step < 500 && g.decision; step++) {
        const decision = g.decision;
        const op = decision.type === "mainPhase" && randomInt(rng, 3) > 0 ? randomOp(g, rng) : null;
        const context = () => `${seed}, step ${step}, ${op ? JSON.stringify(op) : decision.type}`;
        if (op && g.manualOpError(op) === null) {
          expect(() => g.act({ type: "mainPhase", action: { type: "manual", op } }), context()).not.toThrow();
          manualOps++;
        } else {
          g.act(randomAnswer(rng, decision));
        }
        expect(checkInvariants(g.state, engine.db, g.decision), context()).toEqual([]);
      }
      expect(manualOps).toBeGreaterThan(0); // a few games end early (a leader's defense set to 0, forced attacks)
    });
  }
});
