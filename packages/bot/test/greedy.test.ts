import { describe, expect, it } from "vitest";
import { createEngine, script, validateAnswer, type Answer, type GameSession, type PlayerId } from "../src/core";
import { GreedyBot } from "../src";
import { ALL_CARDS, ALL_SCRIPTS } from "../../core/src/sets";
import { PERPETUAL_CYCLE_LIMIT } from "../../core/src/engine/abilities/confirmation";
import { checkInvariants, deckPool, drive, randomAgent, randomDeck, testAmulet, testFollower } from "../../core/src/testing";

// Random decks from every supported set (BP01 onwards); BOT_GAMES=200 runs a longer check.
const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });
const pool = deckPool(engine);
const GAMES = Number(process.env.BOT_GAMES ?? 10);

type Player = (g: GameSession) => Answer;

const newGame = (seed: string) =>
  engine.newGame({ seed, players: [randomDeck(pool, `${seed}/0`), randomDeck(pool, `${seed}/1`)], config: { deckRestrictions: false } });

const botPlayer = (bot: GreedyBot): Player => (g) => bot.decide(g);
const randomPlayer = (seed: string): Player => {
  const agent = randomAgent(seed);
  return (g) => agent(g.decision!, g);
};

/** Play to the end: every answer must be legal and the invariants hold after every input. */
function playGame(g: GameSession, players: [Player, Player]): Answer[] {
  const answers: Answer[] = [];
  while (g.decision && answers.length < 20_000) {
    const d = g.decision;
    const answer = players[d.player](g);
    expect(validateAnswer(d, answer), `${d.type}: ${JSON.stringify(answer)}`).toBeNull();
    g.act(answer);
    expect(checkInvariants(g.state, engine.db, g.decision)).toEqual([]);
    answers.push(answer);
  }
  return answers;
}

const clean = (bot: GreedyBot) => [bot.stats.fallbacks, bot.stats.simulationFailures, bot.stats.lastError];

describe("GreedyBot", () => {
  it("plays whole games against itself and against a random player: legal answers, every game ends", () => {
    for (let i = 0; i < GAMES; i++) {
      const a = new GreedyBot(engine, { seed: `a${i}` });
      const b = new GreedyBot(engine, { seed: `b${i}` });
      const selfPlay = newGame(`robust-bot-${i}`);
      playGame(selfPlay, [botPlayer(a), botPlayer(b)]);
      const vsRandom = newGame(`robust-random-${i}`);
      const c = new GreedyBot(engine, { seed: `c${i}` });
      playGame(vsRandom, i % 2 === 0 ? [botPlayer(c), randomPlayer(`r${i}`)] : [randomPlayer(`r${i}`), botPlayer(c)]);
      expect([selfPlay.result, vsRandom.result]).not.toContain(null);
      for (const bot of [a, b, c]) {
        expect(clean(bot), `game ${i}`).toEqual([0, 0, null]);
        expect(bot.stats.simulations).toBeLessThanOrEqual(bot.stats.decisions * 32);
      }
    }
  }, 60_000 + GAMES * 5_000);

  it("beats a random player", () => {
    let wins = 0;
    for (let i = 0; i < 12; i++) {
      const side: PlayerId = i % 2 === 0 ? 0 : 1;
      const g = newGame(`strength-${i}`);
      const bot = botPlayer(new GreedyBot(engine, { seed: `s${i}` }));
      playGame(g, side === 0 ? [bot, randomPlayer(`sr${i}`)] : [randomPlayer(`sr${i}`), bot]);
      if (g.result?.winner === side) wins += 1;
    }
    expect(wins).toBeGreaterThanOrEqual(11);
  }, 120_000);

  it("is reproducible: same seeds, same game", () => {
    const run = () => playGame(newGame("repro"), [botPlayer(new GreedyBot(engine, { seed: "x" })), botPlayer(new GreedyBot(engine, { seed: "y" }))]);
    expect(run()).toEqual(run());
  }, 60_000);

  it("decides on what its player can see only: other hidden cards, same decision", () => {
    let compared = 0;
    let differentHidden = 0;
    for (let i = 0; i < 6; i++) {
      const g = newGame(`fair-${i}`);
      const random = randomPlayer(`fr${i}`);
      for (let step = 0; g.decision && step < 400; step++) {
        const d = g.decision;
        if (d.type === "mainPhase" && g.state.turn >= 3 && step % 3 === 0) {
          // A game the player can't tell apart from this one: same view, other hidden cards.
          const other = g.determinized(d.player, `other hidden cards ${step}`);
          const opp = (s: GameSession) => [...s.state.players[1 - d.player]!.zones.hand].map((id) => s.state.cards[id]!.def);
          if (JSON.stringify(opp(other)) !== JSON.stringify(opp(g))) differentHidden += 1;
          expect(new GreedyBot(engine, { seed: "fair" }).decide(other)).toEqual(new GreedyBot(engine, { seed: "fair" }).decide(g));
          compared += 1;
        }
        g.act(random(g));
      }
    }
    expect(compared).toBeGreaterThan(10);
    expect(differentHidden).toBeGreaterThan(5);
  }, 120_000);

  describe("never loops forever", () => {
    const { defineCard, activated, whenYourLeaderGainsDefense } = script;
    // FOUNTAIN: a free ability that always helps. ECHO: "Whenever your leader gains defense, you may
    // give your leader +1 defense" — a cycle only its controller can stop.
    const loopEngine = createEngine({
      cards: [testFollower("V1", 1, 2, 2), testAmulet("FOUNTAIN", 1), testAmulet("ECHO", 1)],
      scripts: {
        FOUNTAIN: defineCard({
          abilities: [
            activated(
              {},
              {
                *resolve(fx) {
                  yield* fx.giveLeaderDefense(fx.controller, 1);
                },
              },
            ),
          ],
        }),
        ECHO: defineCard({
          abilities: [
            whenYourLeaderGainsDefense({
              *resolve(fx) {
                if (yield* fx.confirm()) yield* fx.giveLeaderDefense(fx.controller, 1);
              },
            }),
          ],
        }),
      },
    });
    /** Let the bot play player 0's turn; returns the game once it is the other player's turn. */
    const botTurn = (field: string[], options: ConstructorParameters<typeof GreedyBot>[1]) => {
      const t = drive(loopEngine, { me: { field }, opp: { deck: ["V1"] } });
      const bot = new GreedyBot(loopEngine, { seed: "loop", ...options });
      const turn = t.game.state.turn;
      for (let i = 0; i < 1000 && t.game.decision?.player === 0 && t.game.state.turn === turn; i++) t.game.act(bot.decide(t.game));
      return { t, bot, turn };
    };

    it("repeats an ability that always helps only as often as it allows itself (CR 15.2.1.1)", () => {
      const { t, bot, turn } = botTurn(["FOUNTAIN"], { maxActionsPerTurn: 5 });
      expect([t.game.state.turn > turn, t.leader(), clean(bot)]).toEqual([true, 25, [0, 0, null]]);
    }, 60_000);

    it("stops a cycle of optional effects it keeps choosing, before the engine has to call a draw", () => {
      const { t, bot, turn } = botTurn(["FOUNTAIN", "ECHO"], { maxActionsPerTurn: 1, maxDecisionsPerTurn: 30, maxSimulationSteps: 10 });
      expect([t.game.result, t.game.state.turn > turn, clean(bot)]).toEqual([null, true, [0, 0, null]]);
      expect(t.leader()).toBeGreaterThan(21);
      expect(t.leader()).toBeLessThan(20 + PERPETUAL_CYCLE_LIMIT);
    }, 60_000);
  });
});
