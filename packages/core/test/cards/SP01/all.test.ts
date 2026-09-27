import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// SP01 (its other cards are reprints). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). SD02-010 Oathless Knight (2c, Fanfare: a Knight
// token) is an Officer follower, and so is the Knight. BP01-T15 Forest Bat is a Vampire token. SD06-011 / 012 Guardian Nun (evolved: leader
// +2) and SD06-005 Acolyte's Light (banish, leader +2) give defense.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const BAT = "BP01-T15";

describe("SP01", () => {
  it("010 Amelia, Sunny Paladin — an Officer follower entering: 3 damage; act (0), once per turn: an Officer follower costing 2 or less from the hand or EX area", () => {
    const t = d({ me: { field: ["SP01-010"], hand: ["SD02-010"], playPoints: 2 }, opp: { field: ["V5"] } }).play("SD02-010").flush();
    expect([t.field(), t.field("opp")]).toEqual([["SP01-010", "SD02-010", "BP01-T05"], []]);
    const a = d({ me: { field: ["SP01-010"], ex: ["SD02-010"] } }).activate("SP01-010").pick("SD02-010").flush();
    expect([a.field(), a.ex(), a.canActivate("SP01-010")]).toEqual([["SP01-010", "SD02-010", "BP01-T05"], [], false]);
  });

  it("026 Sharon, Seaside Nymph — Fanfare: recover 5 play points; act, engage: up to 2 of 4 options", () => {
    expect(d({ me: { hand: ["SP01-026"], playPoints: 7, maxPlayPoints: 10 } }).play("SP01-026").pp()).toBe(5);
    const t = d({ me: { field: ["SP01-026"], deck: ["V3"] } }).activate("SP01-026").choose("3", "4");
    expect([t.leader(), t.hand(), t.engaged("SP01-026")]).toEqual([22, ["V3"], true]);
    const next = d({ me: { field: ["SP01-026"], hand: ["V1", "V1"], playPoints: 2 } }).activate("SP01-026").choose("2").play("V1").flush().play("V1").flush();
    expect(next.ids("V1@field").map((id) => next.game.reader().info(id).attack)).toEqual([3, 2]);
    const stop = d({ me: { field: ["SP01-026"] }, opp: { field: ["V5"], deck: ["V1"] } }).activate("SP01-026").choose("1").end();
    expect(stop.attackTargets("opp:V5")).toEqual([]);
  });

  it("032 Queen Vampire, Sultry Evening — Fanfare: 4 damage; end phase with 3 other Vampire cards: 3 damage to the enemy leader, leader +3", () => {
    expect(d({ me: { hand: ["SP01-032"], playPoints: 5 }, opp: { field: ["V5"] } }).play("SP01-032").stats("opp:V5")).toEqual([5, 1]);
    const t = d({ me: { field: ["SP01-032", BAT, BAT, BAT] }, opp: { deck: ["V1"] } }).end();
    expect([t.leader("opp"), t.leader()]).toEqual([17, 23]);
    const u = d({ me: { field: ["SP01-032", BAT, BAT] }, opp: { deck: ["V1"] } }).end();
    expect([u.leader("opp"), u.leader()]).toEqual([20, 20]);
  });

  it("039 Zoe, Shore's Melody — Fanfare: destroy and draw if your leader has gained 4 defense this turn in total", () => {
    const spec = (hand: string[], playPoints: number): DriveSpec => ({
      me: { field: ["SD06-011"], evolveDeck: ["SD06-012"], hand, deck: ["V1"], playPoints },
      opp: { field: ["V5", "V3"] },
    });
    const t = d(spec(["SD06-005", "SP01-039"], 6)).evolve("SD06-011").play("SD06-005").pick("opp:V5").play("SP01-039");
    expect([t.field("opp"), t.hand()]).toEqual([[], ["V1"]]);
    const u = d(spec(["SP01-039"], 2)).evolve("SD06-011").play("SP01-039").pick("opp:V3");
    expect([u.field("opp"), u.hand()]).toEqual([["V5", "V3"], []]);
  });

  it("045 Alice, Golden Afternoon — Fanfare: draw; Fanfare: an enemy follower costing 4 or less into its owner's EX area if this wasn't put onto the field from the hand", () => {
    const h = d({ me: { hand: ["SP01-045"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V3"] } }).play("SP01-045").flush();
    expect([h.hand(), h.field("opp")]).toEqual([["V1"], ["V3"]]);
    const x = d({ me: { ex: ["SP01-045"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V3", "V5"] } }).play("SP01-045").flush();
    expect([x.hand(), x.field("opp"), x.ex("opp")]).toEqual([["V1"], ["V5"], ["V3"]]);
  });
});
