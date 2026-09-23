import { describe, expect, it } from "vitest";
import { scenario } from "../../src/testing";
import { act, cardsOf, doMain, only, testEngine } from "../helpers";

const engine = testEngine();

describe("CR 11 rules handling", () => {
  it("11.9.1 — play points above the maximum are lowered to the maximum", () => {
    const g = scenario(engine, { players: [{ hand: ["V1"], playPoints: 5, maxPlayPoints: 3 }, {}] });
    doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "V1")) });
    expect(g.state.players[0].playPoints).toBe(3);
  });

  it("11.4.1 — an over-full field: the player keeps as many cards as the limit allows", () => {
    const g = scenario(engine, {
      players: [{ field: ["V1", "V1", "V1", "V2", "V2", "V3"], hand: ["AMULET"], playPoints: 1 }, {}],
    });
    // Playing is impossible (10.6.2.6), but any action is followed by Confirmation Timing.
    doMain(g, { type: "endMainPhase" });
    const field = g.state.players[0].zones.field;
    expect(g.decision).toMatchObject({ type: "selectCards", reason: "fieldLimitKeep", player: 0, min: 5, max: 5, candidates: field });
    const v3 = only(cardsOf(g, 0, "field", "V3"));
    const events = act(g, { type: "selectCards", cards: field.filter((id) => id !== v3) });
    expect(cardsOf(g, 0, "cemetery", "V3")).toHaveLength(1);
    // Moved to the cemetery, but not destroyed (11.4.1 vs 5.6).
    const move = events.flatMap((e) => (e.type === "cardsMoved" ? e.moves : [])).find((m) => m.card === v3)!;
    expect(move.reason).toBe("rules");
  });

  it("11.5.1 — an over-full EX area: the player keeps as many cards as the limit allows", () => {
    const g = scenario(engine, { players: [{ ex: Array(6).fill("V5"), playPoints: 0 }, {}] });
    doMain(g, { type: "endMainPhase" });
    expect(g.decision).toMatchObject({ type: "selectCards", reason: "exLimitKeep", player: 0, min: 5, max: 5 });
    const ex = g.state.players[0].zones.ex;
    act(g, { type: "selectCards", cards: ex.slice(1) });
    expect(g.state.players[0].zones.ex).toHaveLength(5);
    expect(g.state.players[0].zones.cemetery).toHaveLength(1);
  });

  it("11.3.1 — followers are destroyed when their defense is 0 or less (reason: destroy)", () => {
    const g = scenario(engine, { players: [{ hand: ["V1"], field: [{ card: "V2", damage: 5 }], playPoints: 1 }, {}] });
    const v2 = only(cardsOf(g, 0, "field", "V2"));
    const events = doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "V1")) });
    const move = events.flatMap((e) => (e.type === "cardsMoved" ? e.moves : [])).find((m) => m.card === v2)!;
    expect(move).toMatchObject({ reason: "destroy", to: { zone: "cemetery" } });
  });

  it("1.2.2 — if both players lose simultaneously the game is a draw", () => {
    const g = scenario(engine, { players: [{ hand: ["BOTH-20"] }, {}] });
    doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "BOTH-20")) });
    expect(g.result).toEqual({
      winner: null,
      losses: [
        { player: 0, reason: "leaderDefense" },
        { player: 1, reason: "leaderDefense" },
      ],
    });
  });
});
