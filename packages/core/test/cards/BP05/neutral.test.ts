import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP05 Neutral (103–117). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5; BOTH-20 deals 20 damage
// to each leader (0). BP05-105 Gilnelise, BP05-106 Apostle of Craving and BP05-113 Craving's
// Splendor are Neutral cards.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP05 Neutral", () => {
  it("103 / 104 Mjerrabaine — Rush; end phase: 3 to the enemy leader at 2 cards or less, and to each enemy follower at 0", () => {
    const t = d({ me: { field: ["BP05-103"] }, opp: { field: ["V5"], deck: ["V1"] } }).end();
    expect([t.leader("opp"), t.stats("opp:V5")]).toEqual([17, [5, 2]]);
    const two = d({ me: { field: ["BP05-103"], hand: ["V1", "V1"] }, opp: { field: ["V5"], deck: ["V1"] } }).end();
    expect([two.leader("opp"), two.stats("opp:V5")]).toEqual([17, [5, 5]]);
    const three = d({ me: { field: ["BP05-103"], hand: ["V1", "V1", "V1"] }, opp: { deck: ["V1"] } }).end();
    expect(three.leader("opp")).toBe(20);
    const evo = d({
      me: { field: [{ card: "BP05-103", evolvedInto: "BP05-104", engaged: true }] },
      opp: { field: ["V5"], deck: ["V1"] },
    }).end();
    expect([evo.leader("opp"), evo.field("opp"), evo.engaged("BP05-103")]).toEqual([15, [], false]);
  });

  it("105 Gilnelise — Drain; pay 3 to put Apostle of Craving and Craving's Splendor into the EX area; Neutral plays deal 1", () => {
    const t = d({ me: { hand: ["BP05-105"], deck: ["V1", "BP05-106", "BP05-113"], playPoints: 7 } }).play("BP05-105").flush();
    t.yes().pick("BP05-106").pick("BP05-113");
    expect([t.ex(), t.pp(), t.keywords("BP05-105")]).toEqual([["BP05-106", "BP05-113"], 0, ["drain"]]);
    // Apostle of Craving costs 0 from the EX area now; playing it deals 1 and gives Gilnelise Rush.
    t.play("BP05-106").flush();
    expect([t.leader("opp"), t.keywords("BP05-105")]).toEqual([19, ["drain", "rush"]]);
    const ten = d({ me: { hand: ["BP05-105"], deck: ["V1", "V1", "V1"], playPoints: 10 }, opp: { maxPlayPoints: 10 } });
    ten.play("BP05-105").flush().no();
    expect(ten.hand()).toEqual(["V1", "V1", "V1"]);
  });

  it("106 / 107 Apostle of Craving — 3 less from the EX area with Gilnelise; Rush to another follower; evolved: 3 damage and +3/+0", () => {
    expect(d({ me: { ex: ["BP05-106"], playPoints: 2 } }).canPlay("BP05-106")).toBe(false);
    const t = d({ me: { ex: ["BP05-106"], field: ["BP05-105", "V1"], playPoints: 0 } }).play("BP05-106").flush().pick("V1");
    expect([t.keywords("V1"), t.leader("opp")]).toEqual([["rush"], 19]);
    const evo = d({ me: { field: ["BP05-106", "V5"], evolveDeck: ["BP05-107"], playPoints: 1 } }).evolve("BP05-106");
    expect(evo.stats("V5")).toEqual([8, 2]);
  });

  it("108 Lyrial — Quick: engage for 2 to the enemy leader; your leader takes no ability damage", () => {
    const t = d({ me: { field: ["BP05-108"], hand: ["BOTH-20"] }, opp: { leaderDefense: 30 } }).activate("BP05-108").play("BOTH-20");
    expect([t.leader(), t.leader("opp")]).toEqual([20, 8]);
  });

  it("109 Feena — a 1-cost follower from the top 5, or destroy a 1-cost enemy follower", () => {
    const deck = ["V3", "V1", "V2", "KILL", "FAN-DRAW", "V5"];
    const t = d({ me: { hand: ["BP05-109"], deck }, opp: { field: ["V3"] } }).play("BP05-109").pick("V1").order();
    expect([t.hand(), t.zone("me", "deck")]).toEqual([["V1"], ["V5", "V3", "V2", "KILL", "FAN-DRAW"]]);
    const kill = d({ me: { hand: ["BP05-109"] }, opp: { field: ["V1", "V3"] } }).play("BP05-109").choose("destroy");
    expect(kill.field("opp")).toEqual(["V3"]);
  });

  it("110 / 111 Rosa — Ward; evolved: Ward, draw", () => {
    const t = d({ me: { field: ["BP05-110"], evolveDeck: ["BP05-111"], deck: ["V1"], playPoints: 1 } }).evolve("BP05-110");
    expect([t.hand(), t.keywords("BP05-110"), t.stats("BP05-110")]).toEqual([["V1"], ["ward"], [2, 4]]);
  });

  it("112 Enlightenment — +1/+1; Mjerrabaine gets +3/+3, Assail and no damage this turn instead", () => {
    expect(d({ me: { hand: ["BP05-112"], field: ["V1"] } }).play("BP05-112").stats("V1")).toEqual([3, 3]);
    const m = d({ me: { hand: ["BP05-112"], field: ["BP05-103"] }, opp: { field: ["V5"] } }).play("BP05-112");
    expect([m.stats("BP05-103"), m.keywords("BP05-103"), m.attackTargets("BP05-103")]).toEqual([
      [8, 8],
      ["rush", "assail"],
      ["V5", "opp:leader"],
    ]);
    m.attack("BP05-103", "opp:V5");
    expect([m.stats("BP05-103"), m.field("opp")]).toEqual([[8, 8], []]);
  });

  it("113 Craving's Splendor — Quick; 4 damage and leader +1; 3 less from the EX area with Gilnelise", () => {
    const t = d({ me: { hand: ["BP05-113"] }, opp: { field: ["V5"] } }).play("BP05-113");
    expect([t.stats("opp:V5"), t.leader()]).toEqual([[5, 1], 21]);
    expect(d({ me: { ex: ["BP05-113"], field: ["BP05-105"], playPoints: 0 }, opp: { field: ["V5"] } }).canPlay("BP05-113")).toBe(true);
  });

  it("114 / 115 / T04 Cat Cannoneer — evolved: summon an Ancient Artifact (3/1 Rush)", () => {
    const t = d({ me: { field: ["BP05-114"], evolveDeck: ["BP05-115"], playPoints: 1 } }).evolve("BP05-114");
    expect([t.field(), t.stats("BP05-T04"), t.keywords("BP05-T04")]).toEqual([["BP05-114", "BP05-T04"], [3, 1], ["rush"]]);
  });

  it("116 Steel Demolitionist — banish a card in your EX area for 2 damage to an enemy leader or follower", () => {
    const t = d({ me: { hand: ["BP05-116"], ex: ["V1"] }, opp: { field: ["V1"] } }).play("BP05-116").yes().pick("opp:leader");
    expect([t.leader("opp"), t.zone("me", "banished"), t.ex()]).toEqual([18, ["V1"], []]);
  });

  it("117 Gliesaray — 2 damage, or banish with Gilnelise on your field", () => {
    expect(d({ me: { hand: ["BP05-117"] }, opp: { field: ["V5"] } }).play("BP05-117").stats("opp:V5")).toEqual([5, 3]);
    const g = d({ me: { hand: ["BP05-117"], field: ["BP05-105"] }, opp: { field: ["V5"] } }).play("BP05-117");
    expect([g.zone("opp", "banished"), g.leader("opp")]).toEqual([["V5"], 19]);
  });
});
