import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP01 Abysscraft (101–125) and tokens T12 Mimi, T13 Coco, T14 Ghost.
// BP01-117 Skeleton Fighter (1, 2/2) is used as a cheap Abysscraft follower; BP01-108 Dire Bond
// (1-cost amulet: 1 damage to your leader) turns Sanguine on.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SKELETON = "BP01-117";
const cards = (n: number, id = "V1") => Array<string>(n).fill(id);

describe("BP01 Abysscraft", () => {
  it("101 / 102 Cerberus — Mimi or Coco into EX; Necrocharge (10) or evolved: both", () => {
    const t = d({ me: { hand: ["BP01-101"], playPoints: 4 } }).play("BP01-101").choose("Mimi");
    expect(t.ex()).toEqual(["BP01-T12"]);
    const nc = d({ me: { hand: ["BP01-101"], cemetery: cards(10), playPoints: 4 } }).play("BP01-101");
    expect(nc.ex()).toEqual(["BP01-T12", "BP01-T13"]);
  });

  it("103 Lord Atomy — bury 4 reserved Abysscraft cards (even from a full field) to play it for 9 less", () => {
    const t = d({ me: { hand: ["BP01-103"], field: [...cards(4, SKELETON), "V1"], playPoints: 0 } });
    t.play("BP01-103");
    expect(t.field()).toEqual(["V1", "BP01-103"]);
    expect(t.cemetery()).toEqual(cards(4, SKELETON));
    expect(d({ me: { hand: ["BP01-103"], field: cards(3, SKELETON), ex: cards(3, SKELETON), playPoints: 0 } }).canPlay("BP01-103")).toBe(false);
  });

  it("104 Medusa — Sanguine and Necrocharge (10) each lower the cost by 1; act destroys", () => {
    const t = d({ me: { hand: ["BP01-108", "BP01-104"], deck: ["V1"], cemetery: cards(10), playPoints: 5 }, opp: { field: ["V5"] } });
    t.play("BP01-108").play("BP01-104");
    expect(t.pp()).toBe(0);
    t.activate("BP01-104");
    expect(t.field("opp")).toEqual([]);
  });

  it("105 / 106 Righteous Devil — evolve by paying 3 leader defense; evolved: enemy follower destroyed -> 1 to its leader, +1 to yours", () => {
    const t = d({ me: { field: ["BP01-105"], evolveDeck: ["BP01-106"], hand: ["KILL"], playPoints: 1, evolutionPoints: 3 }, opp: { field: ["V2"] } });
    t.evolve("BP01-105");
    expect([t.leader(), t.pp()]).toEqual([17, 1]);
    t.play("KILL");
    expect([t.leader(), t.leader("opp")]).toEqual([18, 19]);
  });

  it("107 Mordecai — Last Words: pay 3 leader defense to come back", () => {
    const t = d({ me: { field: [{ card: "BP01-107", damage: 5 }], hand: ["V1"], playPoints: 1 } }).play("V1").yes();
    expect(t.field()).toEqual(["V1", "BP01-107"]);
    expect(t.leader()).toBe(17);
  });

  it("108 Dire Bond — 1 damage to your leader and draw; the act does it again", () => {
    const t = d({ me: { hand: ["BP01-108"], deck: ["V1", "V2"], playPoints: 3 } }).play("BP01-108").activate("BP01-108");
    expect([t.leader(), t.hand(), t.cemetery()]).toEqual([18, ["V1", "V2"], ["BP01-108"]]);
  });

  it("109 Hell's Unleasher — bury it: a follower costing 3+ from the cemetery to hand", () => {
    const t = d({ me: { field: ["BP01-109"], cemetery: ["V3", "V1"] } }).activate("BP01-109");
    expect([t.hand(), t.cemetery()]).toEqual([["V3"], ["V1", "BP01-109"]]);
  });

  it("111 Crazed Executioner (Evolved) — 2 to your leader; pick a card from the revealed enemy hand to discard", () => {
    const t = d({ me: { field: ["BP01-110"], evolveDeck: ["BP01-111"], playPoints: 1 }, opp: { hand: ["V1", "V5"] } });
    t.evolve("BP01-110").pick("opp:V5");
    expect([t.leader(), t.hand("opp"), t.cemetery("opp")]).toEqual([18, ["V1"], ["V5"]]);
  });

  it("112 / 113 / 117 — Sanguine fanfares (+1/+1 and Rush / Storm / +1/+1)", () => {
    const t = d({ me: { hand: ["BP01-108", "BP01-112", "BP01-113", SKELETON], deck: ["V1"], playPoints: 8 } });
    t.play(SKELETON);
    expect(t.stats(SKELETON)).toEqual([2, 2]); // no Sanguine yet
    t.play("BP01-108").play("BP01-112").play("BP01-113");
    expect(t.stats("BP01-112")).toEqual([4, 3]);
    expect(t.keywords("BP01-112")).toEqual(["rush"]);
    expect(t.keywords("BP01-113")).toEqual(["storm"]);
  });

  it("114 Phantom Howl / T14 Ghost — 4 Ghosts with Storm, banished at your end phase", () => {
    const t = d({ me: { hand: ["BP01-114"], playPoints: 3 }, opp: { deck: ["V1"] } }).play("BP01-114");
    expect(t.field()).toEqual(cards(4, "BP01-T14"));
    expect(t.attackTargets("BP01-T14")).toEqual(Array(4).fill("opp:leader")); // each Ghost has Storm
    t.end().flush(); // four "banish this card" triggers
    expect(t.field()).toEqual([]);
  });

  it("115 Death's Breath — a follower costing 8 or less from the cemetery, with Ward", () => {
    const t = d({ me: { hand: ["BP01-115"], cemetery: ["V5"], playPoints: 6 } }).play("BP01-115");
    expect(t.field()).toEqual(["V5"]);
    expect(t.keywords("V5")).toEqual(["ward"]);
  });

  it("116 Soul Conversion — destroy your follower, draw 2 (its Last Words trigger)", () => {
    const t = d({ me: { hand: ["BP01-116"], field: ["BP01-121"], deck: ["V1", "V2"], playPoints: 1 } }).play("BP01-116");
    expect([t.hand(), t.leader(), t.leader("opp")]).toEqual([["V1", "V2"], 18, 18]);
  });

  it("118 Ambling Wraith — 1 damage to each leader", () => {
    const t = d({ me: { hand: ["BP01-118"], playPoints: 1 } }).play("BP01-118");
    expect([t.leader(), t.leader("opp")]).toEqual([19, 19]);
  });

  it("119 Spectre — may pay 2 defense for Rush and a card into the cemetery", () => {
    const t = d({ me: { hand: ["BP01-119"], deck: ["V1", "V2"], playPoints: 2 } }).play("BP01-119").yes();
    expect([t.leader(), t.keywords("BP01-119"), t.cemetery()]).toEqual([18, ["bane", "rush"], ["V1"]]);
    const one = d({ me: { hand: ["BP01-119"], playPoints: 2, leaderDefense: 1 } }).play("BP01-119");
    expect(one.decision?.type).toBe("mainPhase"); // cannot pay: not asked
  });

  it("120 Spartoi Sergeant — top 2 cards into the cemetery", () => {
    const t = d({ me: { hand: ["BP01-120"], deck: ["V1", "V2", "V3"], playPoints: 2 } }).play("BP01-120");
    expect(t.cemetery()).toEqual(["V1", "V2"]);
  });

  it("123 Wardrobe Raider (Evolved) — bury a follower of yours (even itself) to destroy an enemy follower", () => {
    const t = d({ me: { field: ["BP01-122", "V1"], evolveDeck: ["BP01-123"] }, opp: { field: ["V5"] } });
    t.evolve("BP01-122").yes().pick("BP01-122");
    expect([t.field(), t.field("opp")]).toEqual([["V1"], []]);
  });

  it("124 Undead King — up to 2 followers from the cemetery to hand", () => {
    const t = d({ me: { hand: ["BP01-124"], cemetery: ["V1", "V2", "V3"], playPoints: 6 } }).play("BP01-124").pick("V1", "V3");
    expect(t.hand()).toEqual(["V1", "V3"]);
  });

  it("125 Razory Claw — 2 to your leader, 3 to an enemy; both leaders at 0 is a draw", () => {
    const t = d({ me: { hand: ["BP01-125"], playPoints: 2, leaderDefense: 1 }, opp: { leaderDefense: 1 } }).play("BP01-125");
    expect(t.game.result?.winner).toBeNull();
  });

  it("T12 Mimi / T13 Coco — 2 damage to an enemy follower / +2 attack to your follower", () => {
    const t = d({ me: { ex: ["BP01-T12", "BP01-T13"], field: ["V1"] }, opp: { field: ["V3"] } });
    t.play("BP01-T12").play("BP01-T13");
    expect([t.stats("opp:V3"), t.stats("V1")]).toEqual([
      [3, 2],
      [4, 2],
    ]);
  });
});
