import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// SD06 (Havencraft starter deck). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral), AMULET a 1-cost amulet. Tokens: BP01-T16 Holy Falcon,
// BP01-T17 Holy Tiger.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const TIGER = "BP01-T17";

describe("SD06 Havencraft", () => {
  it("001 Skullfane — Fanfare: an amulet from the top 4 onto the field, the rest buried; an amulet leaving: 2 damage to the enemy leader and followers", () => {
    const t = d({ me: { hand: ["SD06-001"], deck: ["V1", "SD06-015", "V3", "V5", "V1"], playPoints: 7 } }).play("SD06-001").pick("SD06-015");
    expect([t.field(), t.cemetery(), t.zone("me", "deck")]).toEqual([["SD06-001", "SD06-015"], ["V1", "V3", "V5"], ["V1"]]);
    const a = d({ me: { field: ["SD06-001", "SD06-015"], playPoints: 1 }, opp: { field: ["V3"] } }).activate("SD06-015").flush();
    expect([a.leader("opp"), a.stats("opp:V3")]).toEqual([18, [3, 2]]);
  });

  it("002 Hare of Illusions — engage, bury: engage an enemy follower; (10), engage, bury: banish every follower", () => {
    const t = d({ me: { field: ["SD06-002"] }, opp: { field: ["V5"] } }).activate("SD06-002");
    expect([t.engaged("opp:V5"), t.cemetery()]).toEqual([true, ["SD06-002"]]);
    expect(d({ me: { field: ["SD06-002"] } }).canActivate("SD06-002")).toBe(false);
    const b = d({ me: { field: ["SD06-002", "V1"], playPoints: 10 }, opp: { field: ["V5"] } }).activate("SD06-002", 1);
    expect([b.field(), b.field("opp"), b.zone("me", "banished"), b.zone("opp", "banished")]).toEqual([[], [], ["V1"], ["V5"]]);
  });

  it("003 / 004 Priest of the Cudgel — evolved: banish an enemy follower with 3 or less defense", () => {
    const t = d({ me: { field: ["SD06-003"], evolveDeck: ["SD06-004"], playPoints: 1 }, opp: { field: ["V5", "V1"] } }).evolve("SD06-003");
    expect([t.field("opp"), t.zone("opp", "banished")]).toEqual([["V5"], ["V1"]]);
  });

  it("005 Acolyte's Light — Quick: banish an enemy follower, leader +2", () => {
    const t = d({ me: { hand: ["SD06-005"], playPoints: 4 }, opp: { field: ["V5"] } }).play("SD06-005");
    expect([t.zone("opp", "banished"), t.leader()]).toEqual([["V5"], 22]);
  });

  it("006 Dual Flames — Fanfare: a Holy Tiger; act (2), engage, bury: another", () => {
    expect(d({ me: { hand: ["SD06-006"], playPoints: 4 } }).play("SD06-006").field()).toEqual(["SD06-006", TIGER]);
    const t = d({ me: { field: ["SD06-006", "V1", "V1", "V1", "V1"], playPoints: 2 } }).activate("SD06-006");
    expect(t.field()).toEqual(["V1", "V1", "V1", "V1", TIGER]);
  });

  it("009 / 010 Ardent Nun — Ward; 1 more damage during the opponent's turn (evolved: 2 more)", () => {
    const t = d({ turn: 6, me: { field: [{ card: "SD06-009", engaged: true }] }, opp: { field: ["V5"] } }).attack("opp:V5", "SD06-009");
    expect(t.stats("opp:V5")).toEqual([5, 2]);
    const e = d({ turn: 6, me: { field: [{ card: "SD06-009", evolvedInto: "SD06-010", engaged: true }] }, opp: { field: ["V5"] } });
    expect(e.attack("opp:V5", "SD06-009").field("opp")).toEqual([]);
    expect(d({ me: { field: ["SD06-009"] }, opp: { field: [{ card: "V5", engaged: true }] } }).attack("SD06-009", "opp:V5").stats("opp:V5")).toEqual([5, 3]);
  });

  it("011 / 012 Guardian Nun — Ward; Fanfare with an amulet on your field: +1 defense; evolved: leader +2", () => {
    expect(d({ me: { hand: ["SD06-011"], field: ["AMULET", "AMULET"], playPoints: 3 } }).play("SD06-011").none().stats("SD06-011")).toEqual([3, 4]);
    expect(d({ me: { hand: ["SD06-011"], playPoints: 3 } }).play("SD06-011").none().stats("SD06-011")).toEqual([3, 3]);
    expect(d({ me: { field: ["SD06-011"], evolveDeck: ["SD06-012"], playPoints: 1 } }).evolve("SD06-011").leader()).toBe(22);
  });

  it("015 Pinion Prayer — act (1), engage, bury: a Holy Falcon", () => {
    expect(d({ me: { field: ["SD06-015"], playPoints: 1 } }).activate("SD06-015").field()).toEqual(["BP01-T16"]);
  });

  it("016 Beastly Vow — put onto the field engaged; act (1), engage, bury: a Holy Tiger", () => {
    const t = d({ me: { hand: ["SD06-016"], playPoints: 3 } }).play("SD06-016");
    expect([t.engaged("SD06-016"), t.canActivate("SD06-016")]).toEqual([true, false]);
    expect(d({ me: { field: ["SD06-016"], playPoints: 1 } }).activate("SD06-016").field()).toEqual([TIGER]);
  });
});
