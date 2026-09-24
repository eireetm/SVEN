import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../src/testing";
import { cardEngine } from "../helpers";

// Engine behaviour added or corrected for BP04 that the card tests do not show directly.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const TIGER = "BP01-T17";

describe("BP04 mechanics", () => {
  it("'another amulet leaves' also triggers when this card leaves at the same time (CR 10.7.4.2)", () => {
    // Bahamut (Evolved) destroys every amulet: Holy Sentinel leaves together with the other one.
    const t = d({ me: { field: ["BP02-107", "BP01-141", "AMULET"], evolveDeck: ["BP02-108"], playPoints: 1 } });
    t.evolve("BP02-107").flush();
    expect(t.field()).toEqual(["BP02-107", TIGER]);
  });

  it("the cards played this turn are recorded in order, per player (CR 10.6.2.7)", () => {
    const t = d({ me: { hand: ["V1", "AMULET"], playPoints: 2 } });
    t.play("V1").play("AMULET");
    expect(t.game.reader().cardsPlayedThisTurn(0)).toEqual(["V1", "AMULET"]);
    expect(t.game.reader().cardsPlayedThisTurn(1)).toEqual([]);
  });

  it("BP04-103's protection from ability damage covers the leader and ends with the turn (CR 7.4.8)", () => {
    const t = d({ me: { hand: ["BP04-103"], playPoints: 1 }, opp: { deck: ["V1"] } });
    t.play("BP04-103");
    const protectedCards = () =>
      t.game.state.effects.filter((e) => e.change.kind === "preventDamage").map((e) => t.game.state.cards[e.target]?.zone);
    expect(protectedCards()).toEqual(["leader", "field"]);
    t.end();
    expect(protectedCards()).toEqual([]);
  });
});
