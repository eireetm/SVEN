import { describe, expect, it } from "vitest";
import { EngineError, IllegalInputError, redactEvent, type GameEvent } from "../../src";
import { scenario } from "../../src/testing";
import { act, cardsOf, doMain, leaderId, only, testEngine } from "../helpers";

const engine = testEngine();

describe("GameSession inputs", () => {
  it("rejects illegal answers and leaves the game unchanged", () => {
    const g = scenario(engine, { players: [{ hand: ["V5"], playPoints: 1 }, {}] });
    const before = JSON.stringify(g.state);
    const v5 = only(cardsOf(g, 0, "hand", "V5"));
    expect(() => g.act({ type: "mainPhase", action: { type: "play", card: v5 } })).toThrow(IllegalInputError);
    expect(() => g.act({ type: "confirm", yes: true })).toThrow(/expected a "mainPhase" answer/);
    expect(JSON.stringify(g.state)).toBe(before);
    expect(g.decision).toMatchObject({ type: "mainPhase" });
  });

  it("validates card selections (count, candidates, duplicates)", () => {
    const g = scenario(engine, { players: [{ hand: ["KILL"], playPoints: 1 }, { field: ["V1", "V2"] }] });
    doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "KILL")) });
    const [a, b] = g.state.players[1].zones.field;
    expect(() => g.act({ type: "selectCards", cards: [] })).toThrow(/between 1 and 1/);
    expect(() => g.act({ type: "selectCards", cards: [a!, b!] })).toThrow(IllegalInputError);
    expect(() => g.act({ type: "selectCards", cards: ["nope"] })).toThrow(/not a candidate/);
    act(g, { type: "selectCards", cards: [a!] });
  });

  it("checks who answers when the caller says who is answering", () => {
    const g = scenario(engine, { players: [{}, {}] });
    const end = { type: "mainPhase", action: { type: "endMainPhase" } } as const;
    expect(() => g.act(end, 1)).toThrow(/waiting for player 0/);
    expect(() => g.act({ type: "concede", player: 0 }, 1)).toThrow(IllegalInputError);
    expect(g.decision).toMatchObject({ type: "mainPhase", player: 0 });
  });

  it("1.2.3 — a player may concede at any time and loses immediately", () => {
    const g = scenario(engine, { players: [{ field: ["V1"] }, {}] });
    const events = g.act({ type: "concede", player: 1 });
    expect(events).toEqual([{ type: "gameEnded", result: { winner: 0, losses: [{ player: 1, reason: "concede" }] } }]);
    expect(g.decision).toBeNull();
    expect(() => g.act({ type: "mainPhase", action: { type: "endMainPhase" } })).toThrow(/game is over/);
  });
});

describe("GameSession snapshots", () => {
  it("snapshot / restore reproduces the game, including a pause in the middle of an attack", () => {
    const g = scenario(engine, {
      players: [{ field: ["V5"] }, { hand: ["QUICK-KILL"], playPoints: 1, deck: ["V1"] }],
    });
    const v5 = only(g.state.players[0].zones.field);
    doMain(g, { type: "attack", attacker: v5, target: leaderId(g, 1) });
    expect(g.decision).toMatchObject({ type: "quick", player: 1 });

    const copy = engine.restore(JSON.parse(JSON.stringify(g.snapshot())));
    expect(copy.decision).toEqual(g.decision);
    expect(JSON.stringify(copy.state)).toBe(JSON.stringify(g.state));

    for (const s of [g, copy]) act(s, { type: "quick", action: { type: "pass" } });
    expect(JSON.stringify(copy.state)).toBe(JSON.stringify(g.state));
    expect(g.state.players[1].leaderDefense).toBe(15);
  });

  it("the checkpoint moves to each main phase decision, so snapshots stay short", () => {
    const g = scenario(engine, { players: [{ hand: ["V1", "V1"], playPoints: 2 }, {}] });
    doMain(g, { type: "play", card: cardsOf(g, 0, "hand", "V1")[0]! });
    expect(g.snapshot().inputs).toEqual([]);
  });

  it("clones are independent", () => {
    const g = scenario(engine, { players: [{ hand: ["V1"], playPoints: 1 }, {}] });
    const copy = g.clone();
    doMain(copy, { type: "play", card: only(cardsOf(copy, 0, "hand", "V1")) });
    expect(g.state.players[0].zones.hand).toHaveLength(1);
    expect(copy.state.players[0].zones.hand).toHaveLength(0);
  });

  it("without checkpoints the game plays normally but cannot be snapshotted", () => {
    const g = scenario(engine, { players: [{ hand: ["V1"], playPoints: 1 }, {}] }, { checkpoints: false });
    doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "V1")) });
    expect(() => g.snapshot()).toThrow(EngineError);
  });
});

describe("CR 4.1.2 hidden information", () => {
  it("redacts the identity of cards drawn by the opponent", () => {
    const g = scenario(engine, { players: [{ deck: ["V5"] }, { deck: ["V3"] }] });
    const events = doMain(g, { type: "endMainPhase" }); // player 1 draws
    const draw = (evs: GameEvent[]) => evs.flatMap((e) => (e.type === "cardsMoved" ? e.moves : [])).find((m) => m.reason === "draw")!;
    const own = draw(events.map((e) => redactEvent(e, 1)));
    const theirs = draw(events.map((e) => redactEvent(e, 0)));
    expect(own).toMatchObject({ def: "V3", card: null }); // deck ids are never exposed
    expect(theirs).toMatchObject({ def: "", printing: "", card: null, before: null });
    expect(theirs.newCard).toBe(own.newCard);
  });

  it("player views hide the opponent's hand, all decks and the opponent's facedown evolve deck", () => {
    const g = scenario(engine, {
      players: [
        { hand: ["V1"], deck: ["V2", "V3"], evolveDeck: ["EVOLVER-E"] },
        { hand: ["V5"], deck: ["V1"], evolveDeck: ["EVOLVER-E"] },
      ],
    });
    const v = g.view(0);
    expect(v.players[0].hand).toEqual([expect.objectContaining({ hidden: false, def: "V1" })]);
    expect(v.players[1].hand).toEqual([{ id: g.state.players[1].zones.hand[0], hidden: true }]);
    expect(v.players[0].deckCount).toBe(2);
    expect(JSON.stringify(v)).not.toContain('"V2"');
    expect(v.players[0].evolveDeck[0]).toMatchObject({ hidden: false, def: "EVOLVER-E" });
    expect(v.players[1].evolveDeck[0]).toMatchObject({ hidden: true });
    expect(v.decision).toMatchObject({ type: "mainPhase" });
    expect(g.view(1).decision).toBeNull();
    expect(g.view(1).waitingFor).toBe(0);
  });
});
