import { describe, expect, it } from "vitest";
import { createEngine, IllegalInputError, script, type GameSession, type ManualOp } from "../../src";
import { scenario, testFollower } from "../../src/testing";
import { act, cardsOf, doMain, leaderId, only, stats, TEST_CARDS, TEST_SCRIPTS } from "../helpers";

// Manual operations (model/manual.ts): testing by hand outside the rules, as answers to a main phase decision of a game that
// allows them. The engine's own procedures carry them out, so abilities trigger; replays repeat them.

const { defineCard, activated } = script;
const engine = createEngine({
  cards: [
    ...TEST_CARDS,
    testFollower("ACT-DRAW", 1, 1, 1, { text: "Activate (3), once per turn: draw a card." }),
    testFollower("ACT-FABLE", 1, 1, 1, { text: "Activate (1), remove a Fable counter from this card: draw a card." }),
  ],
  scripts: {
    ...TEST_SCRIPTS,
    "ACT-DRAW": defineCard({
      abilities: [
        activated(
          { playPoints: 3 },
          {
            oncePerTurn: true,
            *resolve(fx) {
              yield* fx.draw(1);
            },
          },
        ),
      ],
    }),
    "ACT-FABLE": defineCard({
      abilities: [
        activated(
          {
            playPoints: 1,
            custom: {
              canPay: (r, _c, self) => r.counters(self, "fable") >= 1,
              *pay(fx) {
                yield* fx.removeCounters(fx.self, "fable", 1);
              },
            },
          },
          {
            *resolve(fx) {
              yield* fx.draw(1);
            },
          },
        ),
      ],
    }),
  },
});

const manual = (g: GameSession, op: ManualOp) => doMain(g, { type: "manual", op });
// A single pending ability resolves without asking, as in games (the triggered abilities these tests look at).
const allowed = { manualActions: true, autoResolve: ["quick", "selectPending"] as const };

describe("manual operations", () => {
  it("are refused by a game that doesn't allow them, and outside a main phase decision", () => {
    const off = scenario(engine, { players: [{ deck: ["V1"] }, {}] });
    expect(() => manual(off, { kind: "draw", player: 0, count: 1 })).toThrow(/doesn't allow manual operations/);
    const on = scenario(engine, { players: [{ hand: ["KILL"], playPoints: 1 }, { field: ["V1"] }], config: allowed });
    doMain(on, { type: "play", card: only(cardsOf(on, 0, "hand", "KILL")) });
    expect(on.decision?.type).toBe("selectCards");
    expect(() => on.act({ type: "mainPhase", action: { type: "manual", op: { kind: "draw", player: 0, count: 1 } } })).toThrow(IllegalInputError);
    // A malformed operation leaves the game as it was.
    const g = scenario(engine, { players: [{ deck: ["V1"] }, {}], config: allowed });
    const before = JSON.stringify(g.state);
    expect(() => manual(g, { kind: "draw", player: 0, count: 0 })).toThrow(/1 to 60/);
    expect(() => manual(g, { kind: "destroy", card: "nope" })).toThrow(/a card on the field/);
    expect(JSON.stringify(g.state)).toBe(before);
  });

  it("are never listed, and either player may give one at a main phase decision", () => {
    const g = scenario(engine, { players: [{ deck: ["V1", "V2"] }, { deck: ["V3"] }], config: allowed });
    expect(g.decision?.type === "mainPhase" && g.decision.actions.some((a) => a.type === "manual")).toBe(false);
    g.act({ type: "mainPhase", action: { type: "manual", op: { kind: "draw", player: 1, count: 1 } } }, 1);
    expect(cardsOf(g, 1, "hand", "V3")).toHaveLength(1);
    expect(g.decision).toMatchObject({ type: "mainPhase", player: 0 });
  });

  it("draw, mill, shuffle and take a card from the deck", () => {
    const g = scenario(engine, { players: [{ deck: ["V1", "V2", "V3", "V5", "STORM"] }, {}], config: allowed });
    manual(g, { kind: "draw", player: 0, count: 2 });
    expect(g.state.players[0].zones.hand.map((id) => g.state.cards[id]!.def)).toEqual(["V1", "V2"]);
    manual(g, { kind: "mill", player: 0, count: 1 });
    expect(cardsOf(g, 0, "cemetery", "V3")).toHaveLength(1);
    manual(g, { kind: "search", player: 0, def: "STORM" });
    expect(cardsOf(g, 0, "hand", "STORM")).toHaveLength(1);
    expect(() => manual(g, { kind: "search", player: 0, def: "STORM" })).toThrow(/no STORM in the deck/);
    const events = manual(g, { kind: "shuffle", player: 0 });
    expect(events.map((e) => e.type)).toEqual(["manualOp", "deckShuffled"]);
  });

  it("set points and the leader's defense (0 or less loses at Confirmation Timing)", () => {
    const g = scenario(engine, { players: [{}, {}], config: allowed });
    manual(g, { kind: "points", player: 0, maxPlayPoints: 8, playPoints: 6, evolutionPoints: 4, superEvolutionPoints: 2 });
    expect(g.state.players[0]).toMatchObject({ maxPlayPoints: 8, playPoints: 6, evolutionPoints: 4, superEvolutionPoints: 2 });
    manual(g, { kind: "leaderDefense", player: 1, value: 25 });
    expect(g.state.players[1].leaderDefense).toBe(25);
    manual(g, { kind: "leaderDefense", player: 1, value: 0 });
    expect(g.result).toMatchObject({ winner: 0 });
  });

  it("move cards anywhere; a card destroyed by hand triggers its Last Words", () => {
    const g = scenario(engine, { players: [{ hand: ["V1"], field: ["LW-DRAW"], deck: ["V2"] }, {}], config: allowed });
    const v1 = only(cardsOf(g, 0, "hand", "V1"));
    manual(g, { kind: "move", card: v1, to: "field" });
    const onField = only(cardsOf(g, 0, "field", "V1"));
    manual(g, { kind: "move", card: onField, to: "deckTop" });
    expect(g.state.cards[g.state.players[0].zones.deck[0]!]!.def).toBe("V1");
    manual(g, { kind: "destroy", card: only(cardsOf(g, 0, "field", "LW-DRAW")) });
    expect(cardsOf(g, 0, "cemetery", "LW-DRAW")).toHaveLength(1);
    expect(cardsOf(g, 0, "hand", "V1")).toHaveLength(1); // Last Words drew the top card
    expect(() => manual(g, { kind: "move", card: leaderId(g, 0), to: "hand" })).toThrow(/a card in a hand/);
  });

  it("engage, damage, heal, stats, keywords and counters", () => {
    const g = scenario(engine, { players: [{ field: ["V5"] }, {}], config: allowed });
    const v5 = only(cardsOf(g, 0, "field", "V5"));
    manual(g, { kind: "engage", card: v5, engaged: true });
    expect(g.state.cards[v5]!.engaged).toBe(true);
    manual(g, { kind: "damage", card: v5, amount: 3 });
    expect(stats(g, v5)).toEqual({ attack: 5, defense: 2 });
    manual(g, { kind: "heal", card: v5, amount: 2 });
    manual(g, { kind: "stats", card: v5, attack: 1, defense: 1 });
    expect(stats(g, v5)).toEqual({ attack: 6, defense: 5 });
    manual(g, { kind: "keyword", card: v5, keyword: "ward" });
    expect(g.reader().info(v5).keywords).toContain("ward");
    manual(g, { kind: "counters", card: v5, counter: "fable", amount: 2 });
    manual(g, { kind: "counters", card: v5, counter: "fable", amount: -1 });
    expect(g.state.cards[v5]!.counters).toEqual({ fable: 1 });
    manual(g, { kind: "damage", card: v5, amount: 9 });
    expect(cardsOf(g, 0, "cemetery", "V5")).toHaveLength(1); // destroyed by rules handling
  });

  it("a follower put onto the field this turn attacks the leader; Strike triggers", () => {
    const g = scenario(engine, { players: [{ field: [{ card: "STRIKE", enteredThisTurn: true }], deck: ["V1", "V2"] }, {}], config: allowed });
    const striker = only(cardsOf(g, 0, "field", "STRIKE"));
    expect(g.decision?.type === "mainPhase" && g.decision.actions.some((a) => a.type === "attack")).toBe(false);
    manual(g, { kind: "attack", attacker: striker, target: leaderId(g, 1) });
    expect(g.state.players[1].leaderDefense).toBe(18);
    expect(cardsOf(g, 0, "hand", "V1")).toHaveLength(1);
    // Engaged now, and it attacks again.
    manual(g, { kind: "attack", attacker: striker, target: leaderId(g, 1) });
    expect(g.state.players[1].leaderDefense).toBe(16);
  });

  it("play a card for free from anywhere; Fanfare triggers", () => {
    const g = scenario(engine, { players: [{ cemetery: ["FAN-DRAW"], deck: ["V1"], playPoints: 0 }, {}], config: allowed });
    manual(g, { kind: "play", card: only(cardsOf(g, 0, "cemetery", "FAN-DRAW")) });
    expect(cardsOf(g, 0, "field", "FAN-DRAW")).toHaveLength(1);
    expect(cardsOf(g, 0, "hand", "V1")).toHaveLength(1);
    expect(g.state.players[0].playPoints).toBe(0);
  });

  it("evolve for free any number of times a turn; On Evolve triggers", () => {
    const g = scenario(engine, {
      players: [{ field: ["EVOLVER", "EVOLVER"], evolveDeck: ["EVOLVER-E2", "EVOLVER-E2"], deck: ["V1", "V2"], evolutionPoints: 0 }, {}],
      config: allowed,
    });
    const [a, b] = cardsOf(g, 0, "field", "EVOLVER");
    const [e1, e2] = cardsOf(g, 0, "evolveDeck", "EVOLVER-E2");
    manual(g, { kind: "evolve", card: a!, evolveCard: e1!, superEvolve: false });
    manual(g, { kind: "evolve", card: b!, evolveCard: e2!, superEvolve: true });
    expect(g.state.players[0].zones.hand).toHaveLength(2);
    expect(stats(g, b!)).toEqual({ attack: 6, defense: 4 });
    expect(() => manual(g, { kind: "evolve", card: a!, evolveCard: e2!, superEvolve: false })).toThrow(/unevolved follower/);
  });

  it("activate an ability for free, more than once a turn", () => {
    const g = scenario(engine, { players: [{ field: ["ACT-DRAW"], deck: ["V1", "V2"], playPoints: 0 }, {}], config: allowed });
    const actor = only(cardsOf(g, 0, "field", "ACT-DRAW"));
    manual(g, { kind: "activate", card: actor, ability: 0 });
    manual(g, { kind: "activate", card: actor, ability: 0 });
    expect(g.state.players[0].zones.hand).toHaveLength(2);
  });

  it("a free activation still pays a cost of counters (the effect may depend on it, BP03-001)", () => {
    const g = scenario(engine, { players: [{ field: ["ACT-FABLE"], deck: ["V1", "V2"], playPoints: 0 }, {}], config: allowed });
    const actor = only(cardsOf(g, 0, "field", "ACT-FABLE"));
    expect(g.manualOpError({ kind: "activate", card: actor, ability: 0 })).not.toBeNull();
    manual(g, { kind: "counters", card: actor, counter: "fable", amount: 1 });
    manual(g, { kind: "activate", card: actor, ability: 0 });
    expect(g.state.cards[actor]!.counters.fable ?? 0).toBe(0);
    expect(g.state.players[0].zones.hand).toHaveLength(1);
  });

  it("create tokens", () => {
    const g = scenario(engine, { players: [{}, {}], config: allowed });
    manual(g, { kind: "token", player: 1, token: "TOKEN", to: "field" });
    expect(cardsOf(g, 1, "field", "TOKEN")).toHaveLength(1);
    expect(() => manual(g, { kind: "token", player: 1, token: "V1", to: "field" })).toThrow(/not a token/);
  });

  it("tell a GUI what can be done by hand now, only at a main phase decision of a game that allows it", () => {
    const g = scenario(engine, {
      players: [{ field: ["EVOLVER", "ACT-DRAW"], evolveDeck: ["EVOLVER-E2"], cemetery: ["FAN-DRAW"], hand: ["KILL"], deck: ["V1"] }, {}],
      config: allowed,
    });
    const options = g.manualOptions()!;
    expect(options.playable).toEqual([only(cardsOf(g, 0, "cemetery", "FAN-DRAW"))]); // KILL has no target
    expect(options.evolveWith[only(cardsOf(g, 0, "field", "EVOLVER"))]).toEqual([{ card: only(cardsOf(g, 0, "evolveDeck", "EVOLVER-E2")), backFace: false }]);
    expect(options.activatable).toEqual([`${only(cardsOf(g, 0, "field", "ACT-DRAW"))}:0`]);
    expect(g.manualOpError({ kind: "play", card: only(cardsOf(g, 0, "hand", "KILL")) })).toMatch(/can't be played/);
    expect(scenario(engine, { players: [{}, {}] }).manualOptions()).toBeNull();
  });

  it("replay exactly (snapshot / restore)", () => {
    const g = scenario(engine, { players: [{ deck: ["V1", "V2", "V3"], field: ["V5"] }, { field: ["V1"] }], config: allowed });
    manual(g, { kind: "shuffle", player: 0 });
    manual(g, { kind: "draw", player: 0, count: 2 });
    manual(g, { kind: "attack", attacker: only(cardsOf(g, 0, "field", "V5")), target: only(cardsOf(g, 1, "field", "V1")) });
    const copy = engine.restore(g.snapshot());
    expect(JSON.stringify(copy.state)).toBe(JSON.stringify(g.state));
    act(copy, { type: "mainPhase", action: { type: "endMainPhase" } });
  });
});
