import { describe, expect, it } from "vitest";
import type { Answer, GameEvent, GameSession } from "../../src";
import { scenario } from "../../src/testing";
import { act, cardsOf, doMain, only, stats, testEngine } from "../helpers";

const engine = testEngine();

function pendingOptions(g: GameSession): string[] {
  const d = g.decision;
  if (!d || d.type !== "selectPending") throw new Error(`expected selectPending, got ${d?.type}`);
  return d.options;
}

const drawsOf = (events: GameEvent[]) =>
  events.flatMap((e) => (e.type === "cardsMoved" ? e.moves.filter((m) => m.reason === "draw").map((m) => m.to.player) : []));

describe("CR 10.7 automatic abilities / 10.5 Confirmation Timing", () => {
  it("12.4 — Fanfare triggers when the card is put onto the field and resolves in the next Confirmation Timing", () => {
    const g = scenario(engine, { players: [{ hand: ["FAN-DRAW"], deck: ["V5"], playPoints: 1 }, {}] });
    const events = doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "FAN-DRAW")) });
    const types = events.map((e) => e.type);
    // Played and put onto the field first; the ability only became pending (10.7.2).
    expect(types.indexOf("abilityTriggered")).toBeGreaterThan(types.indexOf("cardPlayed"));
    expect(g.state.pending).toHaveLength(1);
    act(g, { type: "selectPending", id: only(pendingOptions(g)) });
    expect(cardsOf(g, 0, "hand", "V5")).toHaveLength(1);
    expect(g.state.pending).toHaveLength(0);
  });

  it("10.6.2.3 — an automatic ability selects its targets when played", () => {
    const g = scenario(engine, { players: [{ hand: ["FAN-DMG"], playPoints: 2 }, { field: ["V2", "V1"] }] });
    doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "FAN-DMG")) });
    act(g, { type: "selectPending", id: only(pendingOptions(g)) });
    expect(g.decision).toMatchObject({ type: "selectCards", reason: "target", player: 0, candidates: g.state.players[1].zones.field });
    const v2 = only(cardsOf(g, 1, "field", "V2"));
    act(g, { type: "selectCards", cards: [v2] });
    expect(stats(g, v2)).toEqual({ attack: 2, defense: 2 });
  });

  it("10.7.3.2 — a pending ability that cannot be played (no target) is removed", () => {
    const g = scenario(engine, { players: [{ hand: ["FAN-DMG"], playPoints: 2 }, {}] });
    doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "FAN-DMG")) });
    const events = act(g, { type: "selectPending", id: only(pendingOptions(g)) });
    expect(events.some((e) => e.type === "abilityPlayed")).toBe(false);
    expect(g.state.pending).toHaveLength(0);
    expect(g.decision).toMatchObject({ type: "mainPhase", player: 0 });
  });

  it("10.6.2.3.3 / 10.7.3.2 — an automatic ability needing 2 targets is removed when only 1 exists", () => {
    const g = scenario(engine, { players: [{ hand: ["FAN-KILL2"], playPoints: 3 }, { field: ["V1"] }] });
    doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "FAN-KILL2")) });
    const events = act(g, { type: "selectPending", id: only(pendingOptions(g)) });
    expect(events.some((e) => e.type === "abilityPlayed")).toBe(false);
    expect(g.state.players[1].zones.field).toHaveLength(1);
    expect(g.decision).toMatchObject({ type: "mainPhase", player: 0 });
  });

  it("12.5 / 10.7.4.1.2 — Last Words triggers from the cemetery using its field information", () => {
    const g = scenario(engine, {
      players: [{ hand: ["KILL"], playPoints: 1 }, { field: ["LW-DRAW"], deck: ["V5"] }],
    });
    const lw = only(g.state.players[1].zones.field);
    doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "KILL")) });
    act(g, { type: "selectCards", cards: [lw] });
    // The non-active player's ability (10.5.2.3); its source is the card now in the cemetery (4.1.4.1).
    expect(g.decision).toMatchObject({ type: "selectPending", player: 1 });
    expect(g.state.pending[0]!.source).toBe(only(g.state.players[1].zones.cemetery));
    act(g, { type: "selectPending", id: only(pendingOptions(g)) });
    expect(cardsOf(g, 1, "hand", "V5")).toHaveLength(1);
  });

  it("10.5.2.2 / 10.5.2.3 — the active player's pending abilities resolve before the non-active player's", () => {
    const g = scenario(engine, {
      players: [
        { field: ["LW-DRAW"], deck: ["V1"] },
        { field: [{ card: "LW-DRAW", engaged: true }], deck: ["V1"] },
      ],
    });
    const mine = only(g.state.players[0].zones.field);
    const theirs = only(g.state.players[1].zones.field);
    doMain(g, { type: "attack", attacker: mine, target: theirs });
    // Both 1/1 followers died simultaneously; both Last Words are pending.
    expect(g.state.pending.map((p) => p.controller)).toEqual([0, 1]);
    expect(g.decision).toMatchObject({ type: "selectPending", player: 0 });
    const first = act(g, { type: "selectPending", id: only(pendingOptions(g)) });
    expect(drawsOf(first)).toEqual([0]);
    expect(g.decision).toMatchObject({ type: "selectPending", player: 1 });
    const second = act(g, { type: "selectPending", id: only(pendingOptions(g)) });
    expect(drawsOf(second)).toEqual([1]);
  });

  it("10.7.3.1 — with several pending abilities the controller chooses the order", () => {
    const g = scenario(engine, {
      players: [{ field: [{ card: "LW-DRAW", damage: 1 }, { card: "LW-DRAW", damage: 1 }], hand: ["V1"], deck: ["V1", "V2"], playPoints: 1 }, {}],
    });
    // Any action is followed by Confirmation Timing, where 11.3.1 destroys both 1/1s with 1 damage.
    doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "V1")) });
    const options = pendingOptions(g);
    expect(options).toHaveLength(2);
    act(g, { type: "selectPending", id: options[1]! });
    expect(pendingOptions(g)).toEqual([options[0]]);
    act(g, { type: "selectPending", id: options[0]! });
    expect(g.state.players[0].zones.hand).toHaveLength(2);
  });
});

describe("decisions during resolution and replay", () => {
  it("a paused resolution can be snapshotted, restored and continued identically", () => {
    const g = scenario(engine, {
      players: [{ hand: ["BUFF-SOME"], field: ["V1", "V2", "V3"] }, { field: [{ card: "V1", engaged: true }] }],
    });
    doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "BUFF-SOME")) });
    expect(g.decision).toMatchObject({ type: "selectCards", reason: "effect", player: 0, min: 0, max: 2 });

    const snap = JSON.parse(JSON.stringify(g.snapshot()));
    expect(snap.inputs).toHaveLength(1); // the play, replayed from the main phase checkpoint
    const copy = engine.restore(snap);
    expect(copy.decision).toEqual(g.decision);
    expect(JSON.stringify(copy.state)).toBe(JSON.stringify(g.state));

    const [v1, v2] = g.state.players[0].zones.field;
    const answer: Answer = { type: "selectCards", cards: [v1!, v2!] };
    act(g, answer);
    act(copy, answer);
    expect(JSON.stringify(copy.state)).toBe(JSON.stringify(g.state));
    expect(stats(g, v1!)).toEqual({ attack: 3, defense: 3 });
  });
});
