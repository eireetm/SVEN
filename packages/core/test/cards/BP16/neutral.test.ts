import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP16 Neutral (111–121, T06–T09). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); AMULET is a 1-cost amulet; QUICK-SAC
// (0) destroys one of your followers. Tokens: BP16-T06 Silent Rider, T07 Servant of Cocytus, T08 Demon of Purgatory,
// T09 Astaroth's Reckoning, BP13-T05 Keenedge Artifact, BP05-T04 Ancient Artifact (a Supreme token follower, 1).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("BP16 Neutral", () => {
  it("111 / 112 Olivia, Heroic Dark Angel — Ward; Fanfare: draw; evolved: 5 damage; super-evolved: leader +3, recover 3", () => {
    expect(d({ me: { hand: ["BP16-111"], deck: ["V1"], playPoints: 5 } }).play("BP16-111").none().hand()).toEqual(["V1"]);
    expect(d({ me: { field: ["BP16-111"], evolveDeck: ["BP16-112"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP16-111").field("opp")).toEqual([]);
    const s = d({ me: { field: ["BP16-111"], evolveDeck: ["BP16-112"], playPoints: 1, ...SUPER } }).evolve("BP16-111", { sep: true }).flush();
    expect([s.leader(), s.pp(), s.keywords("BP16-111")]).toEqual([23, 3, ["ward"]]);
  });

  it("113 Ruler of Cocytus — Fanfare: 6 to your leader; Silent Rider, Servant of Cocytus, Demon of Purgatory and Astaroth's Reckoning into the EX area", () => {
    const t = d({ me: { hand: ["BP16-113"], playPoints: 6 } }).play("BP16-113");
    expect([t.leader(), t.ex()]).toEqual([14, ["BP16-T06", "BP16-T07", "BP16-T08", "BP16-T09"]]);
  });

  it("114 / 115 Phildau, Lionheart Ward — Ward; evolved: 3 damage; super-evolved: destroy an enemy card", () => {
    const t = d({ me: { field: ["BP16-114"], evolveDeck: ["BP16-115"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP16-114");
    expect([t.stats("opp:V5"), t.keywords("BP16-114")]).toEqual([[5, 2], ["ward"]]);
    const s = d({ me: { field: ["BP16-114"], evolveDeck: ["BP16-115"], playPoints: 1, ...SUPER }, opp: { field: ["AMULET"] } }).evolve("BP16-114", { sep: true }).flush();
    expect(s.field("opp")).toEqual([]);
  });

  it("116 Alouette, Doomwright Ward — Fanfare: a Keenedge Artifact", () => {
    expect(d({ me: { hand: ["BP16-116"], playPoints: 4 } }).play("BP16-116").field()).toEqual(["BP16-116", "BP13-T05"]);
  });

  it("117 Leah, Bellringer Angel — Ward; Last Words: leader +1, draw", () => {
    const t = d({ me: { field: ["BP16-117"], hand: ["QUICK-SAC"], deck: ["V1"] } }).play("QUICK-SAC");
    expect([t.leader(), t.hand()]).toEqual([21, ["V1"]]);
  });

  it("118 / 119 Apollo, Heaven's Envoy — Fanfare / evolved: 1 to the enemy leader and each enemy follower", () => {
    const t = d({ me: { hand: ["BP16-118"], playPoints: 3 }, opp: { field: ["V1"] } }).play("BP16-118");
    expect([t.leader("opp"), t.stats("opp:V1")]).toEqual([19, [2, 1]]);
    expect(d({ me: { field: ["BP16-118"], evolveDeck: ["BP16-119"], playPoints: 1 } }).evolve("BP16-118").leader("opp")).toBe(19);
  });

  it("120 Divine Thunder — 7 damage and 3 to its leader", () => {
    const t = d({ me: { hand: ["BP16-120"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP16-120");
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 17]);
  });

  it("121 Doomwright Resurgence — another of a Supreme token follower (5 or less) of yours", () => {
    expect(d({ me: { hand: ["BP16-121"], field: ["BP05-T04"], playPoints: 2 } }).play("BP16-121").field()).toEqual(["BP05-T04", "BP05-T04"]);
    expect(d({ me: { hand: ["BP16-121"], field: ["V1"], playPoints: 2 } }).canPlay("BP16-121")).toBe(false);
  });

  it("T06 Silent Rider / T08 Demon of Purgatory / T09 Astaroth's Reckoning — Storm; Ward and a 6-damage Fanfare; enemy leader defense to 1", () => {
    expect(d({ me: { field: ["BP16-T06"] } }).keywords("BP16-T06")).toEqual(["storm"]);
    const demon = d({ me: { ex: ["BP16-T08"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP16-T08@ex").none();
    expect([demon.field("opp"), demon.keywords("BP16-T08")]).toEqual([[], ["ward"]]);
    expect(d({ me: { ex: ["BP16-T09"], playPoints: 10 } }).play("BP16-T09@ex").leader("opp")).toBe(1);
  });
});
