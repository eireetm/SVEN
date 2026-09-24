import { describe, expect, it } from "vitest";
import { createEngine, EngineError } from "../../src";
import { scenario, testFollower } from "../../src/testing";
import { cardsOf, doMain, only, testEngine } from "../helpers";

describe("Engine", () => {
  const cards = [testFollower("A", 1, 1, 1)];

  it("refuses scripts using keywords the engine does not implement (no silent no-ops)", () => {
    expect(() => createEngine({ cards, scripts: { A: { keywords: ["fuse" as "ward"] } } })).toThrow(EngineError);
    expect(() => createEngine({ cards, scripts: { A: { keywords: ["ward", "storm", "assail", "aura", "drain"] } } })).not.toThrow();
  });

  it("can give Drain, which is implemented (CR 12.13)", () => {
    const g = scenario(testEngine(), { players: [{ hand: ["GIVE-DRAIN"], field: ["V1"] }, {}] });
    doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "GIVE-DRAIN")) });
    g.act({ type: "selectCards", cards: g.state.players[0].zones.field.slice(0, 1) });
    expect(g.state.players[0].zones.field.length).toBeGreaterThan(0);
  });

  it("refuses scripts for cards that are not in the card pool", () => {
    expect(() => createEngine({ cards, scripts: { B: {} } })).toThrow(/unknown card definition B/);
  });
});
