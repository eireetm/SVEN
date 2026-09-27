import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// EBD02 (its other cards are reprints). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). Mage (魔法使い) cards: SD03-010 Sammy (1c
// follower), SD03-005 Insight (1c spell).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("EBD02", () => {
  it("003 Falise, Innocent Sea Spray — Fanfare: a Mage follower and a Mage spell costing 3 or less from the top 5 into the EX area, 3 less; playing a Mage card: 2 damage", () => {
    const t = d({ me: { hand: ["EBD02-003"], deck: ["SD03-010", "V1", "SD03-005", "V3", "V5"], playPoints: 6 } }).play("EBD02-003");
    t.pick("SD03-010").pick("SD03-005").order();
    expect([t.ex(), t.zone("me", "deck"), t.canPlay("SD03-010"), t.canPlay("SD03-005")]).toEqual([
      ["SD03-010", "SD03-005"],
      ["V1", "V3", "V5"],
      true,
      true,
    ]);
    const p = d({ me: { field: ["EBD02-003"], hand: ["SD03-005"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).play("SD03-005");
    expect([p.stats("opp:V5"), p.hand()]).toEqual([[5, 3], ["V1"]]);
  });
});
