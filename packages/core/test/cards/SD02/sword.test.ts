import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// SD02 (Swordcraft starter deck). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). Tokens: BP01-T05 Knight, BP01-T07 Steelclad Knight.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("SD02 Swordcraft", () => {
  it("001 Tsubaki — Fanfare: destroy an enemy follower, or Storm", () => {
    expect(d({ me: { hand: ["SD02-001"], playPoints: 6 }, opp: { field: ["V5"] } }).play("SD02-001").choose("1").field("opp")).toEqual([]);
    const t = d({ me: { hand: ["SD02-001"], playPoints: 6 }, opp: { field: ["V5"] } }).play("SD02-001").choose("2");
    expect([t.keywords("SD02-001"), t.attackTargets("SD02-001")]).toEqual([["storm"], ["opp:leader"]]);
  });

  it("003 / 004 Floral Fencer — evolved: a Steelclad Knight and a Knight", () => {
    const t = d({ me: { field: ["SD02-003"], evolveDeck: ["SD02-004"], playPoints: 1 } }).evolve("SD02-003");
    expect(t.field()).toEqual(["SD02-003", "BP01-T07", "BP01-T05"]);
  });

  it("005 Moonlight Assassin — act (1): Bane", () => {
    const t = d({ me: { field: ["SD02-005"], playPoints: 1 } }).activate("SD02-005");
    expect([t.keywords("SD02-005"), t.pp()]).toEqual([["bane"], 0]);
  });

  it("006 White General — Rush; Strike: another follower +2 attack", () => {
    const t = d({ me: { field: ["SD02-006", "V1"] } }).attack("SD02-006", "opp:leader");
    expect([t.stats("V1"), t.leader("opp"), t.keywords("SD02-006")]).toEqual([[4, 2], 15, ["rush"]]);
  });

  it("009 Fencer — Fanfare: another follower +1/+1", () => {
    expect(d({ me: { hand: ["SD02-009"], field: ["V1"], playPoints: 3 } }).play("SD02-009").stats("V1")).toEqual([3, 3]);
  });

  it("010 / 011 Oathless Knight — Fanfare: a Knight; evolved: Assail", () => {
    expect(d({ me: { hand: ["SD02-010"], playPoints: 2 } }).play("SD02-010").field()).toEqual(["SD02-010", "BP01-T05"]);
    const t = d({ me: { field: ["SD02-010"], evolveDeck: ["SD02-011"], playPoints: 1 } }).evolve("SD02-010");
    expect([t.stats("SD02-010"), t.keywords("SD02-010")]).toEqual([[3, 1], ["assail"]]);
  });

  it("012 / 013 Quickblader — Storm; Evolve (3)", () => {
    const t = d({ me: { hand: ["SD02-012"], evolveDeck: ["SD02-013"], playPoints: 4 } }).play("SD02-012");
    expect([t.attackTargets("SD02-012"), t.canEvolve("SD02-012")]).toEqual([["opp:leader"], true]);
    expect(t.evolve("SD02-012").keywords("SD02-012")).toEqual(["storm"]);
  });

  it("016 Unbridled Fury — Quick: damage equal to the followers on your field", () => {
    expect(d({ me: { hand: ["SD02-016"], field: ["V1", "V1"], playPoints: 1 }, opp: { field: ["V5"] } }).play("SD02-016").stats("opp:V5")).toEqual([5, 3]);
  });
});
