import { describe, expect, it } from "vitest";
import { createEngine, script, validateAnswer, type Answer, type GameSession } from "../src/core";
import { GreedyBot, PlannerBot, type PlannerBotOptions } from "../src";
import { ALL_CARDS, ALL_SCRIPTS } from "../../core/src/sets";
import { checkInvariants, deckPool, drive, randomAgent, randomDeck, testFollower, type ScenarioSide } from "../../core/src/testing";

const { defineCard } = script;

// Positions made of test cards: what the planning bots do with their turn where the greedy bot fails (docs/bot.md).
const cards = createEngine({
  cards: [
    testFollower("FAIRY", 1, 1, 1),
    testFollower("BIG", 5, 7, 2),
    testFollower("HITTER", 3, 4, 2),
    testFollower("WARD", 3, 3, 2),
    testFollower("STORM", 2, 3, 1),
    testFollower("LANCE", 1, 6, 1),
    testFollower("WARDLING", 1, 1, 3),
    testFollower("BIGGUY", 1, 5, 5),
    testFollower("FILLER", 1, 1, 1),
  ],
  scripts: {
    WARD: defineCard({ keywords: ["ward"] }),
    WARDLING: defineCard({ keywords: ["ward"] }),
    STORM: defineCard({ keywords: ["storm"] }),
    LANCE: defineCard({ keywords: ["storm"] }),
  },
});
const fillers = Array<string>(10).fill("FILLER");
const MEDIUM: PlannerBotOptions = {};
const HARD: PlannerBotOptions = { cheat: true, replyModel: "planner", opponentQuick: true, replyPlans: 6, beamWidth: 8, maxSimulations: 900 };

/** Let a bot play player 0's turn from the position; what it did, and the game after. */
function myTurn(bot: { decide(g: GameSession): Answer }, me: ScenarioSide, opp: ScenarioSide) {
  const t = drive(cards, { me: { deck: fillers, ...me }, opp: { deck: fillers, ...opp } });
  const turn = t.game.state.turn;
  const done: string[] = [];
  for (let i = 0; i < 100 && t.game.decision?.player === 0 && t.game.state.turn === turn; i++) {
    const answer = bot.decide(t.game);
    if (answer.type === "mainPhase") {
      const a = answer.action;
      const def = (id: string) => t.game.state.cards[id]!.def;
      if (a.type === "play") done.push(`play ${def(a.card)}`);
      if (a.type === "attack") done.push(`${def(a.attacker)}>${t.game.state.cards[a.target]!.zone === "leader" ? "leader" : def(a.target)}`);
    }
    t.game.act(answer);
  }
  return { t, done, opponentLeader: t.game.state.players[1].leaderDefense };
}

describe("PlannerBot: a whole turn at a time", () => {
  for (const [name, options] of [["medium", MEDIUM], ["hard", HARD]] as const) {
    describe(name, () => {
      it("wears down a Ward with small followers so the big one reaches the leader (the greedy bot doesn't attack at all)", () => {
        const me = { field: ["FAIRY", "FAIRY", "FAIRY", "BIG"] };
        const opp = { field: [{ card: "WARD", engaged: true }], leaderDefense: 14 };
        expect(myTurn(new GreedyBot(cards, { seed: "s" }), me, opp).opponentLeader).toBe(14);
        const { done, opponentLeader } = myTurn(new PlannerBot(cards, { seed: "s", ...options }), me, opp);
        expect(done.slice(0, 3)).toEqual(["FAIRY>WARD", "FAIRY>WARD", "BIG>leader"]);
        expect(opponentLeader).toBe(6);
      });

      it("finds lethal that needs the Ward out of the way first", () => {
        const { t } = myTurn(new PlannerBot(cards, { seed: "s", ...options }), { field: ["HITTER", "HITTER", "FAIRY", "FAIRY"] }, { field: [{ card: "WARD", engaged: true }], leaderDefense: 7 });
        expect(t.game.result?.winner).toBe(0);
      });

      it("attacks with a Storm follower the turn it is played", () => {
        const { done, opponentLeader } = myTurn(new PlannerBot(cards, { seed: "s", ...options }), { hand: ["STORM"], playPoints: 2, maxPlayPoints: 2 }, { leaderDefense: 20 });
        expect(done).toEqual(["play STORM", "STORM>leader"]);
        expect(opponentLeader).toBe(17);
      });
    });
  }

  // The opponent's lethal Storm follower is in their hand, or at the bottom of their deck: the same game for a fair player.
  const threatened = (lance: "hand" | "deck") => ({
    me: { hand: ["WARDLING", "BIGGUY"], playPoints: 1, maxPlayPoints: 1, leaderDefense: 5 },
    opp: lance === "hand" ? { hand: ["LANCE"], deck: fillers, maxPlayPoints: 3 } : { hand: ["FILLER"], deck: [...fillers.slice(1), "LANCE"], maxPlayPoints: 3 },
  });
  const firstPlay = (options: PlannerBotOptions, lance: "hand" | "deck") => {
    const { me, opp } = threatened(lance);
    return myTurn(new PlannerBot(cards, { seed: "s", ...options }), me, opp).done[0];
  };

  it("hard reads the opponent's hand: a Ward against the Storm follower it holds, the bigger follower otherwise", () => {
    expect(firstPlay(HARD, "hand")).toBe("play WARDLING");
    expect(firstPlay(HARD, "deck")).toBe("play BIGGUY");
  });

  it("medium doesn't: it can't tell the two games apart", () => {
    expect(firstPlay(MEDIUM, "hand")).toBe(firstPlay(MEDIUM, "deck"));
  });
});

describe("PlannerBot in whole games", () => {
  const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });
  const pool = deckPool(engine);
  const newGame = (seed: string) =>
    engine.newGame({ seed, players: [randomDeck(pool, `${seed}/0`), randomDeck(pool, `${seed}/1`)], config: { deckRestrictions: false } });
  type Player = (g: GameSession) => Answer;
  const botPlayer = (bot: { decide(g: GameSession): Answer }): Player => (g) => bot.decide(g);

  /** Play to the end: every answer legal, the invariants hold after every input. */
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
  const clean = (bot: PlannerBot) => [bot.stats.fallbacks, bot.stats.simulationFailures, bot.stats.lastError];

  it("medium and hard play whole games against the greedy bot and a random player: legal answers, every game ends", () => {
    for (let i = 0; i < 2; i++) {
      for (const [name, options] of [["medium", MEDIUM], ["hard", HARD]] as const) {
        const bot = new PlannerBot(engine, { seed: `${name}${i}`, ...options });
        const g = newGame(`planner-${name}-${i}`);
        const other = i % 2 === 0 ? botPlayer(new GreedyBot(engine, { seed: `g${i}` })) : ((game: GameSession) => randomAgent(`r${i}`)(game.decision!, game));
        playGame(g, i % 2 === 0 ? [botPlayer(bot), other] : [other, botPlayer(bot)]);
        expect(g.result, `${name} game ${i}`).not.toBeNull();
        expect(clean(bot), `${name} game ${i}`).toEqual([0, 0, null]);
      }
    }
  }, 600_000);

  it("is reproducible: same seeds, same game", () => {
    const run = () => playGame(newGame("planner-repro"), [botPlayer(new PlannerBot(engine, { seed: "x" })), botPlayer(new PlannerBot(engine, { seed: "y", ...HARD }))]);
    expect(run()).toEqual(run());
  }, 600_000);

  it("medium decides on what its player can see only: other hidden cards, same decision", () => {
    let compared = 0;
    for (let i = 0; i < 3; i++) {
      const g = newGame(`planner-fair-${i}`);
      const random = randomAgent(`pf${i}`);
      for (let step = 0; g.decision && step < 300; step++) {
        const d = g.decision;
        if (d.type === "mainPhase" && g.state.turn >= 3 && step % 4 === 0) {
          const other = g.determinized(d.player, `other hidden cards ${step}`);
          expect(new PlannerBot(engine, { seed: "fair" }).decide(other)).toEqual(new PlannerBot(engine, { seed: "fair" }).decide(g));
          compared += 1;
        }
        g.act(random(d, g));
      }
    }
    expect(compared).toBeGreaterThan(5);
  }, 600_000);
});
