import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP11 Neutral (103–116, T03–T05). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); KILL a 1-cost spell;
// QUICK-SAC destroys one of your followers; BUFF-SOME gives up to 2 of your followers +1/+1;
// EVOLVER-E is a faceup evolved follower. BP11-105 Quixotic Adventurer is a 2/1 Wasteland follower.
// Tokens: BP11-T03 Dutiful Steed, T04 Bullet Bike, T05 Arcane Personnel Carrier (Mounts).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const STEED = "BP11-T03";
const BIKE = "BP11-T04";
const CARRIER = "BP11-T05";
const evolved = (n: number) => Array<string>(n).fill("EVOLVER-E");

describe("BP11 Neutral", () => {
  it("103 / 104 Sylvia — Fanfare evolves it; evolved: 5 damage with 5 faceup evolved followers in the evolve deck", () => {
    const t = d({ me: { hand: ["BP11-103"], evolveDeck: ["BP11-104"], faceUpEvolveDeck: evolved(5), playPoints: 2 }, opp: { field: ["V5"] } }).play("BP11-103").yes();
    expect([t.game.reader().info(t.id("BP11-103")).evolved, t.field("opp")]).toEqual([true, []]);
    const four = d({ me: { hand: ["BP11-103"], evolveDeck: ["BP11-104"], faceUpEvolveDeck: evolved(4), playPoints: 2 }, opp: { field: ["V5"] } }).play("BP11-103").yes();
    expect(four.stats("opp:V5")).toEqual([5, 5]);
  });

  it("105 / 106 Quixotic Adventurer — a Steed into the EX area; evolves for 4; evolved Last Words: each Mount onto the field, into the EX area or neither", () => {
    expect(d({ me: { hand: ["BP11-105"], playPoints: 1 } }).play("BP11-105").ex()).toEqual([STEED]);
    expect(d({ me: { field: ["BP11-105"], evolveDeck: ["BP11-106"], playPoints: 4 } }).evolve("BP11-105").pp()).toBe(0);
    const lw = d({ me: { field: [{ card: "BP11-105", evolvedInto: "BP11-106" }], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").choose("field").choose("ex").choose("none");
    expect([lw.field(), lw.ex()]).toEqual([[STEED], [BIKE]]);
  });

  it("107 Goblin Queen — a Goblinoid card from the top 5; engage and banish 3 Goblinoid cards: destroy an enemy follower, 3 to its leader", () => {
    const t = d({ me: { hand: ["BP11-107"], deck: ["V1", "BP11-107", "V3"], playPoints: 2 } }).play("BP11-107").pick("BP11-107").order();
    expect(t.hand()).toEqual(["BP11-107"]);
    const act = d({ me: { field: ["BP11-107"], cemetery: ["BP11-107", "BP11-107", "BP11-107"] }, opp: { field: ["V5"] } }).activate("BP11-107");
    expect([act.field("opp"), act.leader("opp"), act.zone("me", "banished").length, act.engaged("BP11-107")]).toEqual([[], 17, 3, true]);
    expect(d({ me: { field: ["BP11-107"], cemetery: ["BP11-107", "BP11-107"] }, opp: { field: ["V5"] } }).canActivate("BP11-107")).toBe(false);
  });

  it("108 Embodiment of Cocytus — search an Archfiend card, or destroy an enemy follower and 3 to your leader", () => {
    const search = d({ me: { hand: ["BP11-108"], deck: ["V1", "BP11-108"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP11-108").choose("search").pick("BP11-108");
    expect(search.hand()).toEqual(["BP11-108"]);
    const kill = d({ me: { hand: ["BP11-108"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP11-108").choose("destroy");
    expect([kill.field("opp"), kill.leader()]).toEqual([[], 17]);
  });

  it("109 / 110 Wandering Chef — leader +2 with a Mount on the field or in the EX area; evolved: a Wasteland card from the top 4", () => {
    expect(d({ me: { hand: ["BP11-109"], ex: [STEED], playPoints: 2 } }).play("BP11-109").leader()).toBe(22);
    expect(d({ me: { hand: ["BP11-109"], playPoints: 2 } }).play("BP11-109").leader()).toBe(20);
    const evo = d({ me: { field: ["BP11-109"], evolveDeck: ["BP11-110"], deck: ["V1", "BP11-105", "V3", "V5"], playPoints: 1 } });
    evo.evolve("BP11-109").pick("BP11-105").order();
    expect(evo.hand()).toEqual(["BP11-105"]);
  });

  it("111 Supercharged Guitarist — Assail; Fanfare draws; Strike recovers 3 play points", () => {
    const t = d({ me: { hand: ["BP11-111"], deck: ["V1"], playPoints: 4 } }).play("BP11-111");
    expect([t.hand(), t.keywords("BP11-111")]).toEqual([["V1"], ["assail"]]);
    expect(d({ me: { field: ["BP11-111"], playPoints: 0, maxPlayPoints: 5 } }).attack("BP11-111", "opp:leader").pp()).toBe(3);
  });

  it("112 Titanic Showdown — enters engaged; followers that cost 7 or more from the top 5; engage and bury: summon the followers among 2 random cards in the hand", () => {
    const t = d({ me: { hand: ["BP11-112"], deck: ["BP11-058", "V1", "BP11-059", "V3", "V5"], playPoints: 7 } });
    t.play("BP11-112").pick("BP11-058", "BP11-059").order();
    expect([t.hand(), t.engaged("BP11-112"), t.canActivate("BP11-112")]).toEqual([["BP11-058", "BP11-059"], true, false]);
    const act = d({ me: { field: ["BP11-112"], hand: ["V3", "KILL"] } }).activate("BP11-112");
    expect([act.field(), act.hand(), act.cemetery()]).toEqual([["V3"], ["KILL"], ["BP11-112"]]);
  });

  it("113 / 114 Rivaylian Bandit — gaining stats gives it Storm; evolved: 2 damage with 2 Mounts; a super-evolution's +1/+1 counts", () => {
    expect(d({ me: { field: ["BP11-113"], hand: ["BUFF-SOME"], playPoints: 1 } }).play("BUFF-SOME").pick("BP11-113").keywords("BP11-113")).toEqual(["storm"]);
    const evo = d({ me: { field: ["BP11-113", STEED], ex: [BIKE], evolveDeck: ["BP11-114"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP11-113");
    expect([evo.stats("opp:V5"), evo.keywords("BP11-113")]).toEqual([[5, 3], []]);
    const sup = d({ me: { field: ["BP11-113"], evolveDeck: ["BP11-114"], playPoints: 2, superEvolutionPoints: 1, turnsPassed: 8 } }).evolve("BP11-113", { sep: true }).pending();
    expect([sup.stats("BP11-113"), sup.keywords("BP11-113")]).toEqual([[3, 3], ["storm"]]);
  });

  it("115 Vagabond Lizard — may put a Bullet Bike onto the field or into the EX area; Last Words a Steed into the EX area", () => {
    expect(d({ me: { hand: ["BP11-115"], playPoints: 2 } }).play("BP11-115").choose("field").field()).toEqual(["BP11-115", BIKE]);
    expect(d({ me: { hand: ["BP11-115"], playPoints: 2 } }).play("BP11-115").choose("ex").ex()).toEqual([BIKE]);
    expect(d({ me: { field: ["BP11-115"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual([STEED]);
  });

  it("116 Spice Shower — Quick; 1 to the enemy leader, leader +1, draw", () => {
    const t = d({ me: { hand: ["BP11-116"], deck: ["V1"], playPoints: 2 } }).play("BP11-116");
    expect([t.leader("opp"), t.leader(), t.hand()]).toEqual([19, 21, ["V1"]]);
  });

  it("T03 / T04 / T05 Mounts — bury: a follower of yours gets +1/+1, Rush and +1 attack, or Ward and +1 defense (the bonuses only for Wasteland followers)", () => {
    const steed = d({ me: { field: [STEED, "BP11-105", "V1"] } }).activate(STEED).pick("BP11-105");
    expect([steed.stats("BP11-105"), steed.field()]).toEqual([[3, 2], ["BP11-105", "V1"]]);
    expect(d({ me: { field: [STEED, "V1"] } }).activate(STEED).stats("V1")).toEqual([2, 2]);
    const bike = d({ me: { field: [BIKE, "BP11-105", "V1"] } }).activate(BIKE).pick("BP11-105");
    expect([bike.stats("BP11-105"), bike.keywords("BP11-105")]).toEqual([[3, 1], ["rush"]]);
    const plainBike = d({ me: { field: [BIKE, "V1"] } }).activate(BIKE);
    expect([plainBike.stats("V1"), plainBike.keywords("V1")]).toEqual([[2, 2], ["rush"]]);
    const carrier = d({ me: { field: [CARRIER, "BP11-105"] } }).activate(CARRIER);
    expect([carrier.stats("BP11-105"), carrier.keywords("BP11-105")]).toEqual([[2, 2], ["ward"]]);
  });
});
