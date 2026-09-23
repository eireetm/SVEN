import { describe, expect, it } from "vitest";
import type { CardMove } from "../../src";
import { scenario } from "../../src/testing";
import { act, cardsOf, doMain, mainActions, only, testEngine } from "../helpers";

const engine = testEngine();
const moves = (events: ReturnType<typeof act>): CardMove[] =>
  events.flatMap((e) => (e.type === "cardsMoved" ? e.moves : []));

describe("CR 8.2 / 10.6.2 playing a card", () => {
  it("pays the cost and puts a follower onto the field reserved (10.6.2.5, 10.6.2.8.1, 4.2.2.3)", () => {
    const g = scenario(engine, { players: [{ hand: ["V2"], playPoints: 3 }, {}] });
    const card = only(cardsOf(g, 0, "hand", "V2"));
    const events = doMain(g, { type: "play", card });
    const onField = only(cardsOf(g, 0, "field", "V2"));
    expect(g.state.players[0].playPoints).toBe(1);
    expect(g.state.cards[onField]).toMatchObject({ engaged: false, enteredFieldTurn: g.state.turn, zone: "field" });
    // 10.6.2.1 hand -> resolution zone, 10.6.2.8.1 resolution zone -> field
    const m = moves(events);
    expect(m.map((x) => [x.from?.zone, x.to.zone])).toEqual([
      ["hand", "resolution"],
      ["resolution", "field"],
    ]);
    // CR 4.1.4 — a new card object in every zone
    expect(m[0]!.card).toBe(card);
    expect(m[0]!.newCard).toBe(m[1]!.card);
    expect(m[1]!.newCard).toBe(onField);
    expect(new Set([card, m[0]!.newCard, onField]).size).toBe(3);
    expect(events.map((e) => e.type)).toContain("cardPlayed");
  });

  it("10.6.2.5 / 10.6.2.1.2 — a card whose cost cannot be paid cannot be played", () => {
    const g = scenario(engine, { players: [{ hand: ["V2"], playPoints: 1 }, {}] });
    expect(mainActions(g)).toEqual([{ type: "endMainPhase" }]);
  });

  it("10.6.2.6 — followers and amulets cannot be played onto a full field", () => {
    const g = scenario(engine, {
      players: [{ hand: ["V1", "AMULET", "KILL"], field: Array(5).fill("V2"), playPoints: 5 }, { field: ["V1"] }],
    });
    const plays = mainActions(g).filter((a) => a.type === "play");
    expect(plays).toEqual([{ type: "play", card: only(cardsOf(g, 0, "hand", "KILL")) }]);
  });

  it("8.2.1 — a card can be played from the EX area", () => {
    const g = scenario(engine, { players: [{ ex: ["V1"], playPoints: 1 }, {}] });
    const card = only(cardsOf(g, 0, "ex", "V1"));
    const events = doMain(g, { type: "play", card });
    expect(moves(events).map((x) => x.from?.zone)).toEqual(["ex", "resolution"]);
    expect(cardsOf(g, 0, "field", "V1")).toHaveLength(1);
  });

  it("10.6.2.3 / 10.6.2.8.2.3 — a spell selects its target when played, then goes to the cemetery", () => {
    const g = scenario(engine, { players: [{ hand: ["KILL"], playPoints: 1 }, { field: ["V5", "V1"] }] });
    doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "KILL")) });
    const enemy = g.state.players[1].zones.field;
    expect(g.decision).toMatchObject({ type: "selectCards", reason: "target", player: 0, candidates: enemy, min: 1, max: 1 });
    // The spell is in the resolution zone while targets are chosen (10.6.2.1).
    expect(g.state.resolution).toHaveLength(1);
    const v5 = only(cardsOf(g, 1, "field", "V5"));
    act(g, { type: "selectCards", cards: [v5] });
    expect(cardsOf(g, 1, "field", "V5")).toHaveLength(0);
    expect(cardsOf(g, 1, "cemetery", "V5")).toHaveLength(1);
    expect(cardsOf(g, 0, "cemetery", "KILL")).toHaveLength(1);
    expect(g.state.resolution).toHaveLength(0);
  });

  it("10.6.2.3.3 — a spell whose required target does not exist cannot be played", () => {
    const g = scenario(engine, { players: [{ hand: ["KILL"], playPoints: 1 }, {}] });
    expect(mainActions(g)).toEqual([{ type: "endMainPhase" }]);
  });

  it("10.6.2.3.1 / 10.6.2.3.3 — 'select 2' needs 2 legal targets, otherwise the card cannot be played", () => {
    const one = scenario(engine, { players: [{ hand: ["KILL2"], playPoints: 1 }, { field: ["V1"] }] });
    expect(mainActions(one).filter((a) => a.type === "play")).toEqual([]);

    const two = scenario(engine, { players: [{ hand: ["KILL2"], playPoints: 1 }, { field: ["V1", "V2", "V3"] }] });
    doMain(two, { type: "play", card: only(cardsOf(two, 0, "hand", "KILL2")) });
    expect(two.decision).toMatchObject({ type: "selectCards", reason: "target", min: 2, max: 2 });
    const [a, b] = two.state.players[1].zones.field;
    act(two, { type: "selectCards", cards: [a!, b!] });
    expect(two.state.players[1].zones.field).toHaveLength(1);
  });

  it("10.6.2.3.2 — 'select up to 2' can be played with fewer targets, even none", () => {
    const none = scenario(engine, { players: [{ hand: ["PING-UPTO2"] }, {}] });
    const events = doMain(none, { type: "play", card: only(cardsOf(none, 0, "hand", "PING-UPTO2")) });
    expect(events.some((e) => e.type === "cardPlayed")).toBe(true);
    expect(none.decision).toMatchObject({ type: "mainPhase" }); // nothing to select, no decision

    const one = scenario(engine, { players: [{ hand: ["PING-UPTO2"] }, { field: ["V2"] }] });
    doMain(one, { type: "play", card: only(cardsOf(one, 0, "hand", "PING-UPTO2")) });
    expect(one.decision).toMatchObject({ type: "selectCards", reason: "target", min: 0, max: 1 });
  });

  it("12.3.5 — Quick cards can also be played in the main phase", () => {
    const g = scenario(engine, { players: [{ hand: ["QUICK-KILL"], playPoints: 1 }, { field: ["V1"] }] });
    expect(mainActions(g)[0]).toEqual({ type: "play", card: only(cardsOf(g, 0, "hand", "QUICK-KILL")) });
  });

  it("9.1.4.4 — a token put into the cemetery is eliminated", () => {
    const g = scenario(engine, { players: [{ hand: ["KILL"], playPoints: 1 }, { field: ["TOKEN"] }] });
    doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "KILL")) });
    const token = only(g.state.players[1].zones.field);
    const events = act(g, { type: "selectCards", cards: [token] });
    const m = moves(events).find((x) => x.card === token)!;
    expect(m.to.zone).toBe("cemetery");
    expect(events).toContainEqual({ type: "tokensEliminated", cards: [m.newCard] });
    expect(g.state.players[1].zones.cemetery).toHaveLength(0);
    expect(g.state.cards[m.newCard!]).toBeUndefined();
  });

  it("12.8.2 (i) — a follower with Ward may be put onto the field engaged", () => {
    const g = scenario(engine, { players: [{ hand: ["WARD", "WARD"], playPoints: 4 }, {}] });
    const [w1, w2] = cardsOf(g, 0, "hand", "WARD");
    doMain(g, { type: "play", card: w1! });
    const first = only(cardsOf(g, 0, "field", "WARD"));
    expect(g.decision).toMatchObject({ type: "selectCards", reason: "wardEnterEngaged", player: 0, candidates: [first], min: 0, max: 1 });
    act(g, { type: "selectCards", cards: [first] });
    doMain(g, { type: "play", card: w2! });
    act(g, { type: "selectCards", cards: [] });
    const engaged = cardsOf(g, 0, "field", "WARD").map((id) => g.state.cards[id]!.engaged);
    expect(engaged).toEqual([true, false]);
  });
});
