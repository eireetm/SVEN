import { describe, expect, it } from "vitest";
import { createEngine, EngineError } from "../../src";
import { scenario, testFollower } from "../../src/testing";
import { cardsOf, doMain, only, testEngine } from "../helpers";

describe("Engine", () => {
  const cards = [testFollower("A", 1, 1, 1)];

  it("refuses scripts using keywords the engine does not implement (no silent no-ops)", () => {
    expect(() => createEngine({ cards, scripts: { A: { keywords: ["drain"] } } })).toThrow(EngineError);
    expect(() => createEngine({ cards, scripts: { A: { keywords: ["ward", "storm", "assail", "aura"] } } })).not.toThrow();
  });

  it("refuses to give an unimplemented keyword at runtime", () => {
    const g = scenario(testEngine(), { players: [{ hand: ["GIVE-DRAIN"], field: ["V1"] }, {}] });
    doMain(g, { type: "play", card: only(cardsOf(g, 0, "hand", "GIVE-DRAIN")) });
    expect(() => g.act({ type: "selectCards", cards: g.state.players[0].zones.field.slice(0, 1) })).toThrow(
      /"drain" is not implemented/,
    );
  });

  it("refuses scripts for cards that are not in the card pool", () => {
    expect(() => createEngine({ cards, scripts: { B: {} } })).toThrow(/unknown card definition B/);
  });
});
