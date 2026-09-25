import { expect, it } from "vitest";
import type { Answer, CardDefinition, DeckList, GameSession, PlayerId } from "../../src";
import { randomInt, seedRng, shuffleInPlace } from "../../src/rng/rng";
import { ALL_CARDS, SETS, type SupportedSet } from "../../src/sets";
import { checkInvariants, playOut, randomAgent, randomAnswer, scenario, type Agent, type ScenarioSide } from "../../src/testing";
import { poolEngine } from "../helpers";

/**
 * Extra cards for the player in the busy scenario, so that cards with narrow requirements
 * (e.g. "select an Armed follower on your field") can be played too. Added for every card.
 */
export interface SmokeExtras {
  hand?: string[];
  field?: string[];
  cemetery?: string[];
  /** Other scenario settings for the player (e.g. `returnedToHand` for BP03-005). */
  side?: Partial<ScenarioSide>;
  /**
   * Cards that can't be played during their player's own turn (BP06-105): they are played in the
   * quick window of the opponent's end phase instead (CR 7.4.5).
   */
  opponentsTurn?: string[];
  /** Scenario settings for one card only, e.g. a field of 5 Machina followers for BP07-070. */
  perCard?: Record<string, Partial<ScenarioSide>>;
  /**
   * Cards the busy scenario can't use, with the reason (e.g. BP07-105: evolved only by BP07-104's
   * Last Words). Their card tests and the random games cover them.
   */
  notInScenario?: Record<string, string>;
}

/**
 * Whole-set checks (every card script of one set runs, in random situations):
 *  1. every card is played / evolved / activated in a busy scenario with random choices;
 *  2. random games between random decks built from the set.
 * All invariants are checked after every input, and games must restore identically from a
 * snapshot. The engine holds the whole card pool (later sets reuse earlier tokens).
 */
export function setSmokeTests(set: SupportedSet, opts: { games: number; extras?: SmokeExtras }): void {
  const engine = poolEngine();
  const extras = opts.extras ?? {};
  const defs = SETS[set].cards;
  const playable = defs.filter((c) => !c.token && !c.evolved && c.type !== "leader");
  const spells = playable.filter((c) => c.type === "spell");
  // Back faces of double-faced cards (CR 2.14) are not cards by themselves.
  const evolvedCards = defs.filter((c) => c.evolved && c.frontFace === undefined);

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
      if (card.type === "leader" || extras.notInScenario?.[card.id] !== undefined) continue;
      // An evolved card normally shares its base's name (CR 5.16.1.1.1); some are evolved into
      // by an evolve ability that names part of their name instead (BP03-056 -> BP03-058, and
      // from an earlier set: BP03-056 -> BP04-061), or names them (a face of a double-faced card,
      // BP09-004 -> BP09-005 and its back face BP09-005_back).
      const base = card.evolved
        ? (ALL_CARDS.find((d) => d.name === card.name && !d.evolved) ??
          ALL_CARDS.find((d) =>
            (engine.scripts[d.id]?.abilities ?? []).some(
              (a) =>
                a.kind === "activated" &&
                ((a.evolveNameIncludes !== undefined && card.name.includes(a.evolveNameIncludes)) || (a.evolveInto?.includes(card.name) ?? false)),
            ),
          ))
        : card;
      // The physical card of a back face is its front (CR 2.14.2).
      const physical = card.frontFace ?? card.id;
      if (!base) throw new Error(`${card.id} has no base card`);
      const inOpponentsTurn = extras.opponentsTurn?.includes(card.id) ?? false;
      const g = scenario(engine, {
        seed: card.id,
        // Turn 6 belongs to the second player (the opponent here).
        ...(inOpponentsTurn ? { turn: 6 } : {}),
        players: [
          {
            // Tokens cannot exist in a hand (CR 9.1.4.1 / 9.1.4.3), so they are played from the EX area.
            hand: [...(card.evolved || card.token ? ["BP01-042"] : [card.id]), ...(extras.hand ?? [])],
            field: [
              ...(card.evolved ? [base.id] : []),
              "BP01-T10", // a Stack amulet for Earth Rite
              "BP01-042",
              { card: "BP01-173", engaged: true },
              ...(extras.field ?? []),
            ],
            evolveDeck: card.evolved ? [physical] : [],
            ex: ["BP01-T03", "BP01-T11", ...(card.token ? [card.id] : [])],
            // 10 spells for Spellchain, plus a few other cards for Necrocharge.
            cemetery: [...pick(`${card.id}:spells`, spells, 10), ...pick(`${card.id}:cem`, playable, 6), ...(extras.cemetery ?? [])],
            deck: pick(`${card.id}:deck`, playable, 12),
            playPoints: 10,
            maxPlayPoints: 10,
            evolutionPoints: 2,
            leaderDefense: 12,
            ...extras.side,
            ...extras.perCard?.[card.id],
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
      const mine = (id: string) => g.state.cards[id]!.def === card.id || g.state.cards[id]!.def === base.id;
      if (inOpponentsTurn) {
        // The opponent ends their main phase; play the card in the end phase's quick window.
        const rng = seedRng(`${card.id}:opp`);
        let played = false;
        for (let i = 0; i < 200 && g.decision && !played; i++) {
          const q = g.decision;
          if (q.type === "mainPhase" && q.player === 1) g.act({ type: "mainPhase", action: q.actions.find((a) => a.type === "endMainPhase")! });
          else if (q.type === "quick" && q.player === 0 && q.actions.some((a) => a.type === "play" && mine(a.card))) {
            g.act({ type: "quick", action: q.actions.find((a) => a.type === "play" && mine(a.card))! });
            played = true;
          } else g.act(randomAnswer(rng, q));
          assertOk(g);
        }
        if (!played) skipped.push(card.id);
        else settle(g, card.id);
        continue;
      }
      const d = g.decision;
      if (d?.type !== "mainPhase") throw new Error(`${card.id}: expected a main phase decision`);
      // The evolve action that reveals this card (face).
      const revealed = (a: (typeof d.actions)[number]) => {
        if (a.type !== "evolve") return null;
        const def = g.state.cards[a.evolveCard]!.def;
        return a.backFace ? engine.db.get(def).backFace : def;
      };
      const action =
        d.actions.find((a) => a.type === "evolve" && mine(a.card) && revealed(a) === card.id) ??
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

  // SMOKE_GAMES=3000 runs a longer fuzz: rare crashes need thousands of games (BP03-027 needed ~2000).
  const games = Number(process.env.SMOKE_GAMES ?? opts.games);
  it(`${set}: random games with random decks keep every invariant and replay identically`, () => {
    let finished = 0;
    for (let i = 0; i < games; i++) {
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
    expect(finished).toBe(games);
  }, 120_000 + games * 200);
}
