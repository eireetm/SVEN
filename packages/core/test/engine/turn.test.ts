import { describe, expect, it } from "vitest";
import { scenario } from "../../src/testing";
import { act, cardsOf, doMain, endMain, mainActions, only, stats, testEngine } from "../helpers";

const engine = testEngine();

describe("CR 7.2 start phase", () => {
  it("7.2.1–7.2.4 / 3.3.2 — max PP +1, PP refilled, field refreshed, one card drawn", () => {
    const g = scenario(engine, {
      turn: 5, // player 0's turn; player 1 has passed 2 turns
      players: [
        { field: [{ card: "V1", engaged: true }] },
        { deck: ["V2", "V3"], field: [{ card: "V1", engaged: true }], playPoints: 0 },
      ],
    });
    endMain(g);
    const p1 = g.state.players[1];
    expect(g.state.turn).toBe(6);
    expect(g.state.activePlayer).toBe(1);
    expect(p1.turnsPassed).toBe(3);
    expect([p1.maxPlayPoints, p1.playPoints]).toEqual([3, 3]);
    expect(g.state.cards[p1.zones.field[0]!]!.engaged).toBe(false); // refreshed
    expect(g.state.cards[g.state.players[0].zones.field[0]!]!.engaged).toBe(true); // not the opponent's
    expect(p1.zones.hand.map((id) => g.state.cards[id]!.def)).toEqual(["V2"]); // drew the top card
    expect(p1.zones.deck).toHaveLength(1);
  });

  it("3.2.4.1 / 7.2.1 — maximum play points never exceed 10", () => {
    const g = scenario(engine, { turn: 25, players: [{}, { deck: ["V1"], maxPlayPoints: 10 }] });
    endMain(g);
    expect(g.state.players[1].maxPlayPoints).toBe(10);
    expect(g.state.players[1].playPoints).toBe(10);
  });

  it("5.10.1.1 / 11.2.2 — drawing from an empty deck loses at the next rules handling", () => {
    const g = scenario(engine, { players: [{}, { deck: [] }] });
    endMain(g);
    expect(g.result).toEqual({ winner: 0, losses: [{ player: 1, reason: "deckOut" }] });
    expect(g.decision).toBeNull();
    expect(g.state.phase).toBe("over");
  });
});

describe("CR 7.4 end phase", () => {
  it("7.4.3 — the active player may engage followers with Ward", () => {
    const g = scenario(engine, { players: [{ field: ["WARD", "V1"] }, { deck: ["V1"] }] });
    endMain(g);
    const ward = only(cardsOf(g, 0, "field", "WARD"));
    expect(g.decision).toMatchObject({ type: "selectCards", reason: "wardEngage", player: 0, candidates: [ward], min: 0, max: 1 });
    act(g, { type: "selectCards", cards: [ward] });
    expect(g.state.cards[ward]!.engaged).toBe(true);
  });

  it("7.4.5 — the non-active player gets a quick window at the end of the turn", () => {
    const g = scenario(engine, {
      players: [{ field: ["V1"] }, { hand: ["QUICK-KILL"], deck: ["V1"], playPoints: 1 }],
    });
    endMain(g);
    const d = g.decision!;
    expect(d).toMatchObject({ type: "quick", player: 1, timing: "endPhase" });
    const spell = only(cardsOf(g, 1, "hand", "QUICK-KILL"));
    act(g, { type: "quick", action: { type: "play", card: spell } });
    const target = only(g.state.players[0].zones.field);
    expect(g.decision).toMatchObject({ type: "selectCards", reason: "target", player: 1, candidates: [target] });
    const events = act(g, { type: "selectCards", cards: [target] });
    expect(events).toContainEqual({ type: "playPointsChanged", player: 1, playPoints: 0, maxPlayPoints: 2 });
    expect(g.state.players[0].zones.field).toHaveLength(0);
    // 7.4.6 — the window repeats; nothing else can be played, so it closes and the turn passes.
    expect(g.state.activePlayer).toBe(1);
    expect(g.state.turn).toBe(6);
  });

  it("7.4.7 — discard down to the hand limit", () => {
    const g = scenario(engine, {
      players: [{ hand: Array(9).fill("V5"), playPoints: 0 }, { deck: ["V1"] }],
    });
    endMain(g);
    expect(g.decision).toMatchObject({ type: "selectCards", reason: "handLimitDiscard", player: 0, min: 2, max: 2 });
    const hand = g.state.players[0].zones.hand;
    act(g, { type: "selectCards", cards: hand.slice(0, 2) });
    expect(g.state.players[0].zones.hand).toHaveLength(7);
    expect(g.state.players[0].zones.cemetery).toHaveLength(2);
  });

  it("7.4.8 — 'until the end of the turn' effects end", () => {
    const g = scenario(engine, { players: [{ hand: ["BUFF-SOME"], field: ["V1"] }, { deck: ["V1"] }] });
    const v1 = only(g.state.players[0].zones.field);
    doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "BUFF-SOME")) });
    act(g, { type: "selectCards", cards: [v1] });
    expect(stats(g, v1)).toEqual({ attack: 3, defense: 3 });
    endMain(g);
    expect(stats(g, v1)).toEqual({ attack: 2, defense: 2 });
  });
});

describe("CR 7.3 main phase", () => {
  it("7.3.3 — the active player chooses among the legal actions, including ending the phase", () => {
    const g = scenario(engine, { players: [{ hand: ["V1", "V5"], playPoints: 1 }, {}] });
    const actions = mainActions(g);
    const v1 = only(cardsOf(g, 0, "hand", "V1"));
    expect(actions).toEqual([{ type: "play", card: v1 }, { type: "endMainPhase" }]);
  });
});
