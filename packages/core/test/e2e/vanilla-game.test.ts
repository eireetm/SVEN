import { describe, expect, it } from "vitest";
import type { Answer, DeckList, Decision, GameEvent, GameSession, MainAction, PlayerId } from "../../src";
import { checkInvariants, ownedCardCounts, playOut, randomAgent, type Agent } from "../../src/testing";
import { bp01Engine } from "../helpers";

/**
 * End-to-end games with BP01 cards that have no effect text (plus Goblin / Goliath, whose
 * only text is their evolve ability): the whole flow from CR 6.2 to 1.2 with real data.
 */
const engine = bp01Engine();
const DECK: DeckList = {
  main: [
    ...Array<string>(10).fill("BP01-042"), // Ninja Trainee 1: 2/2
    ...Array<string>(10).fill("BP01-171"), // Goblin 1: 2/2, evolve 4 -> 4/4
    ...Array<string>(10).fill("BP01-173"), // Fighter 2: 2/3
    ...Array<string>(10).fill("BP01-174"), // Goliath 3: 3/4, evolve 2 -> 5/6
  ],
  evolve: [...Array<string>(5).fill("BP01-172"), ...Array<string>(5).fill("BP01-175")],
};

function newGame(seed: string | number, config: Record<string, unknown> = {}): GameSession {
  // 10 copies per card: deck construction restrictions are switched off.
  return engine.newGame({ seed, players: [DECK, DECK], config: { deckRestrictions: false, firstPlayer: 0, ...config } });
}

function assertInvariants(g: GameSession) {
  const errors = checkInvariants(g.state as never, engine.db, g.decision);
  if (errors.length > 0) throw new Error(errors.join("\n"));
  // Cards are neither created nor lost: leader + 40 + 10 for each player.
  expect(ownedCardCounts(g.state as never, engine.db)).toEqual([51, 51]);
}

/** A simple deterministic player: evolve, play the biggest card, trade up or go face. */
const greedy: Agent = (d: Decision, g: GameSession): Answer => {
  switch (d.type) {
    case "chooseTurnOrder":
      return { type: "chooseTurnOrder", goFirst: true };
    case "mulligan":
      return { type: "mulligan", redraw: false };
    case "quick":
      return { type: "quick", action: { type: "pass" } };
    case "selectPending":
      return { type: "selectPending", id: d.options[0]! };
    case "selectCards":
      return { type: "selectCards", cards: d.candidates.slice(0, d.min) };
    case "choose":
      return { type: "choose", ids: d.options.slice(0, d.min).map((o) => o.id) };
    case "orderCards":
      return { type: "orderCards", order: d.cards.map((c) => c.id) };
    case "confirm":
      return { type: "confirm", yes: false };
    case "mainPhase": {
      const r = g.reader();
      const by = <T extends MainAction["type"]>(t: T) => d.actions.filter((a): a is Extract<MainAction, { type: T }> => a.type === t);
      const evolve = by("evolve").find((a) => !a.superEvolve) ?? by("evolve")[0];
      if (evolve) return { type: "mainPhase", action: evolve };
      const plays = by("play").sort((a, b) => (r.info(b.card).cost ?? 0) - (r.info(a.card).cost ?? 0));
      if (plays[0]) return { type: "mainPhase", action: plays[0] };
      const attacks = by("attack");
      const trade = attacks.find((a) => {
        const t = r.info(a.target);
        const me = r.info(a.attacker);
        return t.type === "follower" && (me.attack ?? 0) >= (t.defense ?? 0) && (t.attack ?? 0) < (me.defense ?? 0);
      });
      const face = attacks.find((a) => r.info(a.target).type === "leader");
      const attack = trade ?? face;
      if (attack) return { type: "mainPhase", action: attack };
      return { type: "mainPhase", action: { type: "endMainPhase" } };
    }
  }
};

describe("end-to-end vanilla games (BP01)", () => {
  it("a full game follows the turn structure and ends by leader defense (CR 7, 8, 11.2.1)", () => {
    const g = newGame("e2e-greedy", { autoResolve: [] });
    const events: GameEvent[] = [...g.startupEvents];
    const turnStarts: { turn: number; player: PlayerId }[] = [];
    let steps = 0;
    while (g.decision && steps < 5000) {
      const d = g.decision;
      if (d.type === "mainPhase" && !turnStarts.some((t) => t.turn === g.state.turn)) {
        const p = g.state.players[d.player];
        turnStarts.push({ turn: g.state.turn, player: d.player });
        // 7.2.1 / 7.2.2 — at the first main phase decision of a turn, PP = max = turns passed (<= 10)
        expect(p.maxPlayPoints).toBe(Math.min(p.turnsPassed, 10));
        expect(p.playPoints).toBe(p.maxPlayPoints);
        // 7.1 — turns alternate, starting with the first player
        expect(d.player).toBe(g.state.turn % 2 === 1 ? 0 : 1);
      }
      events.push(...g.act(greedy(d, g)));
      assertInvariants(g);
      steps += 1;
    }
    expect(g.result).not.toBeNull();
    expect(g.result!.losses).toEqual([{ player: g.result!.winner === 0 ? 1 : 0, reason: "leaderDefense" }]);

    // 7.2.4.1 — the first player does not draw on turn 1; everyone else draws each turn.
    const draws = (turn: number) => {
      const start = events.findIndex((e) => e.type === "turnStarted" && e.turn === turn);
      const next = events.findIndex((e, i) => i > start && e.type === "phaseStarted" && e.phase === "main");
      return events
        .slice(start, next)
        .flatMap((e) => (e.type === "cardsMoved" ? e.moves : []))
        .filter((m) => m.reason === "draw").length;
    };
    expect(draws(1)).toBe(0);
    expect(draws(2)).toBe(1);
    expect(draws(3)).toBe(1);
    // Evolution happened, with the evolved cards' stats (Goblin 4/4, Goliath 5/6).
    expect(events.some((e) => e.type === "evolved")).toBe(true);
    expect(turnStarts.length).toBeGreaterThan(4);
  });

  it("replaying the same seed and answers reproduces the game exactly", () => {
    const answers: Answer[] = [];
    const a = newGame("replay", { firstPlayer: null });
    playOut(a, [randomAgent("x"), randomAgent("y")], { onStep: (_s, ans) => answers.push(ans) });
    const b = newGame("replay", { firstPlayer: null });
    for (const ans of answers) b.act(ans);
    expect(JSON.stringify(b.state)).toBe(JSON.stringify(a.state));
    expect(b.result).toEqual(a.result);
  });

  it("fuzz: random games keep every invariant and restore identically from any snapshot", () => {
    const GAMES = 150;
    let totalSteps = 0;
    let replayed = 0;
    for (let i = 0; i < GAMES; i++) {
      const g = newGame(`fuzz-${i}`, {
        firstPlayer: i % 3 === 0 ? null : ((i % 2) as PlayerId),
        autoResolve: i % 2 === 0 ? ["mainPhase", "quick", "selectPending", "selectCards"] : [],
      });
      const agents: [Agent, Agent] = [randomAgent(`a${i}`), randomAgent(`b${i}`)];
      const snapshotAt = 5 + (i % 20);
      let snapshot: ReturnType<GameSession["snapshot"]> | null = null;
      const later: Answer[] = [];
      let step = 0;
      totalSteps += playOut(g, agents, {
        maxSteps: 3000,
        onStep: (s, answer) => {
          step += 1;
          assertInvariants(s);
          if (snapshot) later.push(answer);
          else if (step === snapshotAt && s.decision) snapshot = JSON.parse(JSON.stringify(s.snapshot()));
        },
      });
      expect(g.result, `game ${i} did not finish`).not.toBeNull();
      if (snapshot) {
        const copy = engine.restore(snapshot);
        for (const answer of later) copy.act(answer);
        expect(JSON.stringify(copy.state), `game ${i} replay`).toBe(JSON.stringify(g.state));
        replayed += 1;
      }
    }
    expect(totalSteps).toBeGreaterThan(GAMES * 10);
    expect(replayed).toBeGreaterThan(GAMES * 0.8);
    // A limit against hangs, not a speed requirement: alone it takes about 20 s, next to the whole suite's set tests about 60 s.
  }, 120_000);
});
