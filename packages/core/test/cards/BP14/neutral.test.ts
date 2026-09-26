import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP14 Neutral (105–119). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). Festive: BP14-008, BP14-012, BP14-T02
// Glittering Gold. BP01-154 Flame and Glass is an Archfiend card; BP13-118 Fallen Harpist a Fallen Angel card.
// Goblinoid: BP14-116, BP14-119. Token: BP05-T04 Ancient Artifact.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP14 Neutral", () => {
  it("105 / 106 Magna Saber — Ward; Fanfare: 4 damage; evolves with 3 Festive cards on your field and/or in your EX area; evolved: 5 damage divided between up to 2", () => {
    const spec = (ex: string[]): DriveSpec => ({ me: { field: ["BP14-105", "BP14-008"], ex, evolveDeck: ["BP14-106"], playPoints: 1 }, opp: { field: ["V5", "V3"] } });
    expect(d(spec([])).canEvolve("BP14-105")).toBe(false);
    const t = d(spec(["BP14-012"])).evolve("BP14-105").pick("opp:V5", "opp:V3").choose("3");
    expect([t.stats("opp:V5"), t.stats("opp:V3"), t.keywords("BP14-105")]).toEqual([[5, 2], [3, 2], ["ward"]]);
    expect(d({ me: { hand: ["BP14-105"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP14-105").none().stats("opp:V5")).toEqual([5, 1]);
  });

  it("107 Flame and Glass, Duality — Fanfare / act: banish a Fiend or Archfiend card from the cemetery to destroy up to 2 enemy cards / to gain Storm", () => {
    const t = d({ me: { hand: ["BP14-107"], cemetery: ["BP01-154"], playPoints: 6 }, opp: { field: ["V5", "V3", "V1"] } }).play("BP14-107").yes().pick("opp:V5", "opp:V3");
    expect([t.field("opp"), t.zone("me", "banished")]).toEqual([["V1"], ["BP01-154"]]);
    expect(d({ me: { field: ["BP14-107"], cemetery: ["BP01-154"] } }).activate("BP14-107").keywords("BP14-107")).toEqual(["storm"]);
    expect(d({ me: { field: ["BP14-107"], cemetery: ["V1"] } }).canActivate("BP14-107")).toBe(false);
  });

  it("108 / 109 Glistering Angel — Ward; Fanfare: leader +2 with 5 Angel cards in the cemetery; evolved: an Angel or Fallen Angel card from the top 4", () => {
    expect(d({ me: { hand: ["BP14-108"], cemetery: n(5, "BP14-108"), playPoints: 2 } }).play("BP14-108").none().leader()).toBe(22);
    expect(d({ me: { hand: ["BP14-108"], cemetery: n(4, "BP14-108"), playPoints: 2 } }).play("BP14-108").none().leader()).toBe(20);
    const evo = d({ me: { field: ["BP14-108"], evolveDeck: ["BP14-109"], deck: ["V1", "BP13-118", "V3", "V5"], playPoints: 1 } }).evolve("BP14-108").pick("BP13-118").order();
    expect(evo.hand()).toEqual(["BP13-118"]);
  });

  it("110 Angel's Blessing — Quick; leader +2, draw 2", () => {
    const t = d({ me: { hand: ["BP14-110"], deck: ["V1", "V3"], playPoints: 3 } });
    expect(t.keywords("BP14-110")).toEqual(["quick"]);
    expect([t.play("BP14-110").leader(), t.hand()]).toEqual([22, ["V1", "V3"]]);
  });

  it("111 Magna Transformation — Fanfare: a Magna Saber from the deck into the EX area; bury it when a Magna Saber of yours evolves: leader +1", () => {
    expect(d({ me: { hand: ["BP14-111"], deck: ["V1", "BP14-105"], playPoints: 1 } }).play("BP14-111").pick("BP14-105").ex()).toEqual(["BP14-105"]);
    const t = d({ me: { field: ["BP14-111", "BP14-105", "BP14-008", "BP14-012"], evolveDeck: ["BP14-106"], playPoints: 1 } }).evolve("BP14-105").flush().yes();
    expect([t.leader(), t.field()]).toEqual([21, ["BP14-105", "BP14-008", "BP14-012"]]);
    const other = d({ me: { field: ["BP14-111", "BP14-112"], evolveDeck: ["BP14-113"], playPoints: 1 } }).evolve("BP14-112");
    expect([other.leader(), other.field()]).toEqual([20, ["BP14-111", "BP14-112", "BP05-T04"]]);
  });

  it("112 / 113 Gunslinger Automaton — Fanfare: the top card into the EX area; evolved: an Ancient Artifact", () => {
    expect(d({ me: { hand: ["BP14-112"], deck: ["V3"], playPoints: 3 } }).play("BP14-112").ex()).toEqual(["V3"]);
    expect(d({ me: { field: ["BP14-112"], evolveDeck: ["BP14-113"], playPoints: 1 } }).evolve("BP14-112").field()).toEqual(["BP14-112", "BP05-T04"]);
  });

  it("114 Ogre Weaponmaster — Fanfare: 6 to one enemy follower, or 3 to each", () => {
    expect(d({ me: { hand: ["BP14-114"], playPoints: 6 }, opp: { field: ["V5", "V3"] } }).play("BP14-114").choose("one").pick("opp:V5").field("opp")).toEqual(["V3"]);
    expect(d({ me: { hand: ["BP14-114"], playPoints: 6 }, opp: { field: ["V5", "V3"] } }).play("BP14-114").choose("all").stats("opp:V5")).toEqual([5, 2]);
  });

  it("115 Stay in Paradise — a Festive card from the top 4 into the EX area", () => {
    expect(d({ me: { hand: ["BP14-115"], deck: ["V1", "BP14-012", "V3", "V5"], playPoints: 1 } }).play("BP14-115").pick("BP14-012").order().ex()).toEqual(["BP14-012"]);
  });

  it("116 / 117 Brave Goblin — Fanfare (2), discard a Goblinoid card: 4 damage and +2/+2; evolved: draw", () => {
    const t = d({ me: { hand: ["BP14-116", "BP14-119"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP14-116").yes();
    expect([t.stats("opp:V5"), t.stats("BP14-116"), t.pp(), t.cemetery()]).toEqual([[5, 1], [4, 4], 0, ["BP14-119"]]);
    expect(d({ me: { field: ["BP14-116"], evolveDeck: ["BP14-117"], deck: ["V1"], playPoints: 1 } }).evolve("BP14-116").hand()).toEqual(["V1"]);
  });

  it("118 Torchbearing Guide — Fanfare: a Festive card from hand into the EX area to draw, +1/+1 with 3 Festive cards there", () => {
    const t = d({ me: { hand: ["BP14-118", "BP14-008"], ex: ["BP14-012", "BP14-T02"], deck: ["V1"], playPoints: 2 } }).play("BP14-118").yes();
    expect([t.ex(), t.hand(), t.stats("BP14-118")]).toEqual([["BP14-012", "BP14-T02", "BP14-008"], ["V1"], [3, 4]]);
    const two = d({ me: { hand: ["BP14-118", "BP14-008"], ex: ["BP14-012"], deck: ["V1"], playPoints: 2 } }).play("BP14-118").yes();
    expect(two.stats("BP14-118")).toEqual([2, 3]);
  });

  it("119 Goblin Assault — 3 damage; 2 less for discarding a Goblinoid card", () => {
    const t = d({ me: { hand: ["BP14-119", "BP14-116"], playPoints: 0 }, opp: { field: ["V5"] } }).play("BP14-119");
    expect([t.stats("opp:V5"), t.cemetery()]).toEqual([[5, 2], ["BP14-116", "BP14-119"]]);
    // It can't discard itself: it is in the resolution zone when the cost is paid (CR 10.6.2.1).
    expect(d({ me: { hand: ["BP14-119"], playPoints: 0 }, opp: { field: ["V5"] } }).canPlay("BP14-119")).toBe(false);
  });
});
