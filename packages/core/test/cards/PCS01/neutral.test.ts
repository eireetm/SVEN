import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// PCS01 (Princess Connect! Re: Dive starter deck; its other cards are reprints). V1 is 1c 2/2 (Neutral). CP04-001 Kokkoro is a 1-cost
// PriConne follower.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("PCS01", () => {
  it("048 / 049 Princess Knight — other PriConne followers have Ward; Fanfare: the top card onto the field if it's a PriConne follower; evolved: another PriConne follower +10/+10", () => {
    expect(d({ me: { field: ["PCS01-048", "CP04-001"] } }).keywords("CP04-001")).toEqual(["ward"]);
    const t = d({ me: { hand: ["PCS01-048"], deck: ["CP04-001", "V1"], playPoints: 8 } }).play("PCS01-048").none().flush();
    expect([t.field(), t.keywords("PCS01-048")]).toEqual([["PCS01-048", "CP04-001"], []]);
    expect(d({ me: { hand: ["PCS01-048"], deck: ["V1"], playPoints: 8 } }).play("PCS01-048").zone("me", "deck")).toEqual(["V1"]);
    const e = d({ me: { field: ["PCS01-048", "CP04-001"], evolveDeck: ["PCS01-049"], playPoints: 1 } }).evolve("PCS01-048");
    expect([e.stats("CP04-001"), e.keywords("CP04-001"), e.stats("PCS01-048")]).toEqual([[11, 11], ["ward"], [3, 3]]);
  });
});
