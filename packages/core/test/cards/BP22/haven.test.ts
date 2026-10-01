import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP22 Havencraft (092–109, T01). Pre-release cards with Japanese names (data/preview.ts). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5
// (Neutral); WARD is 2c 1/3 with Ward; AMULET a 1c amulet. BP03-094 Wingy (1c Ward), BP22-103 (2c Ward), BP01-T16 Holy Falcon.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("BP22 Havencraft", () => {
  it("092 ゴッド・オブ・カース — X less, X = your turn count; your end phase: 2 to the enemy leader, leader +2; Fanfare: -5/-5", () => {
    expect(d({ me: { hand: ["BP22-092"], turnsPassed: 5, playPoints: 4 } }).canPlay("BP22-092")).toBe(true);
    expect(d({ me: { hand: ["BP22-092"], turnsPassed: 5, playPoints: 3 } }).canPlay("BP22-092")).toBe(false);
    const t = d({ me: { hand: ["BP22-092"], turnsPassed: 5, leaderDefense: 10, playPoints: 4 }, opp: { field: ["V5", "V3"], deck: ["V1"] } });
    t.play("BP22-092").pick("opp:V5");
    expect(t.field("opp")).toEqual(["V3"]);
    t.end();
    expect([t.leader("opp"), t.leader()]).toEqual([18, 12]);
  });

  it("093 / 094 ホーリーセイバー — Ward; Fanfare with 3 Ward followers: 2 damage; evolved: 2 damage, super-evolved: a 聖女の号令", () => {
    const t = d({ me: { hand: ["BP22-093"], field: ["WARD", "WARD"], playPoints: 2 }, opp: { field: ["V5", "V3"] } }).play("BP22-093").none().pick("opp:V5");
    expect([t.stats("opp:V5"), t.keywords("BP22-093")]).toEqual([[5, 3], ["ward"]]);
    const two = d({ me: { hand: ["BP22-093"], field: ["WARD"], playPoints: 2 }, opp: { field: ["V5", "V3"] } }).play("BP22-093").none().pick("opp:V5");
    expect(two.stats("opp:V5")).toEqual([5, 5]);
    const e = d({ me: { field: ["BP22-093"], evolveDeck: ["BP22-094"], ...SUPER }, opp: { field: ["V5", "V3"] } }).evolve("BP22-093", { sep: true });
    e.pending().pick("opp:V5").flush();
    expect([e.stats("opp:V5"), e.ex()]).toEqual([[5, 3], ["BP22-T01"]]);
  });

  it("095 白翼の慈愛・アイテール — Ward; Fanfare, discard a Ward follower: a 2-cost and a 1-cost Ward follower from the deck onto the field", () => {
    const t = d({ me: { hand: ["BP22-095", "WARD"], deck: ["BP22-103", "BP03-094", "V1"], playPoints: 4 } }).play("BP22-095").none().yes();
    t.pick("BP22-103").pick("BP03-094").none().flush();
    expect([t.field(), t.cemetery()]).toEqual([["BP22-095", "BP22-103", "BP03-094"], ["WARD"]]);
  });

  it("096 / 097 セイクリッドレオ — Assail, Bane, no combat damage; Evolve (1), bury an amulet; evolved, Strike: draw 2, discard 1: a follower 3 to the leader, an amulet 3 to each enemy follower", () => {
    const t = d({ me: { field: ["BP22-096"] }, opp: { field: [{ card: "V5", engaged: true }] } }).attack("BP22-096", "opp:V5");
    expect([t.stats("BP22-096"), t.field("opp"), t.keywords("BP22-096")]).toEqual([[0, 5], [], ["assail", "bane"]]);
    const e = d({ me: { field: ["BP22-096", "AMULET"], evolveDeck: ["BP22-097"], playPoints: 1 } }).evolve("BP22-096");
    expect([e.field(), e.stats("BP22-096")]).toEqual([["BP22-096"], [0, 5]]);
    const s = d({ me: { field: [{ card: "BP22-096", evolvedInto: "BP22-097" }], deck: ["V1", "AMULET"] }, opp: { field: ["V5", "V3"] } });
    s.attack("BP22-096", "opp:leader").pick("AMULET");
    expect([s.stats("opp:V5"), s.stats("opp:V3"), s.leader("opp")]).toEqual([[5, 2], [3, 1], 20]);
    const f = d({ me: { field: [{ card: "BP22-096", evolvedInto: "BP22-097" }], deck: ["V1", "AMULET"] }, opp: { field: ["V5"] } });
    f.attack("BP22-096", "opp:leader").pick("V1");
    expect([f.stats("opp:V5"), f.leader("opp")]).toEqual([[5, 5], 17]);
  });

  it("098 カースメイデン — Fanfare: a ゴッド・オブ・カース from the deck; act, engage, bury this, with one on your field: -2/-2 to each enemy follower", () => {
    expect(d({ me: { hand: ["BP22-098"], deck: ["V1", "BP22-092"], playPoints: 2 } }).play("BP22-098").pick("BP22-092").hand()).toEqual(["BP22-092"]);
    const t = d({ me: { field: ["BP22-098", "BP22-092"] }, opp: { field: ["V5", "V1"] } }).activate("BP22-098");
    expect([t.field(), t.field("opp"), t.stats("opp:V5")]).toEqual([["BP22-092"], ["V5"], [3, 3]]);
    expect(d({ me: { field: ["BP22-098"] }, opp: { field: ["V5"] } }).canActivate("BP22-098")).toBe(false);
  });

  it("099 天空の守護者・ガルラ — another Avian follower entering: 3 damage; act (1): a Holy Falcon, once per turn", () => {
    const t = d({ me: { field: ["BP22-099"], playPoints: 2 }, opp: { field: ["V5", "V3"] } }).activate("BP22-099").pick("opp:V5");
    expect([t.field(), t.stats("opp:V5"), t.canActivate("BP22-099")]).toEqual([["BP22-099", "BP01-T16"], [5, 2], false]);
  });

  it("100 / 101 ミラクルラフター・カルミア — Evolve (4); Fanfare with 5 cards on your field: evolves; evolved: draw 2, discard 1", () => {
    const t = d({ me: { hand: ["BP22-100"], field: ["V1", "V1", "V1", "V1"], evolveDeck: ["BP22-101"], deck: ["V3", "V5"], playPoints: 2 } });
    t.play("BP22-100").yes().pick("V3");
    expect([t.stats("BP22-100"), t.hand(), t.cemetery()]).toEqual([[4, 4], ["V5"], ["V3"]]);
    expect(d({ me: { hand: ["BP22-100"], field: ["V1", "V1", "V1"], evolveDeck: ["BP22-101"], playPoints: 2 } }).play("BP22-100").stats("BP22-100")).toEqual([2, 2]);
  });

  it("102 天昇のプリズムプリースト — Fanfare: may put a 2-cost-or-less amulet from the hand onto the field; act, engage 3 amulets: +1/+1, leader +2", () => {
    expect(d({ me: { hand: ["BP22-102", "AMULET"], playPoints: 2 } }).play("BP22-102").pick("AMULET").field()).toEqual(["BP22-102", "AMULET"]);
    const t = d({ me: { field: ["BP22-102", "AMULET", "AMULET", "AMULET"], leaderDefense: 10 } }).activate("BP22-102");
    expect([t.stats("BP22-102"), t.leader(), t.engaged("AMULET")]).toEqual([[3, 4], 12, true]);
    expect(d({ me: { field: ["BP22-102", "AMULET", "AMULET"] } }).canActivate("BP22-102")).toBe(false);
  });

  it("103 希望の守護者・ソニア — Ward; Fanfare: a Ward follower from the top 3", () => {
    const t = d({ me: { hand: ["BP22-103"], deck: ["V1", "WARD", "V3"], playPoints: 2 } }).play("BP22-103").none().pick("WARD").order();
    expect([t.hand(), t.keywords("BP22-103")]).toEqual([["WARD"], ["ward"]]);
  });

  it("104 ホーリーキャット — Fanfare with an amulet on your field: evolves", () => {
    expect(d({ me: { hand: ["BP22-104"], field: ["AMULET"], evolveDeck: ["BP22-105"], playPoints: 2 } }).play("BP22-104").yes().stats("BP22-104")).toEqual([3, 4]);
    expect(d({ me: { hand: ["BP22-104"], evolveDeck: ["BP22-105"], playPoints: 2 } }).play("BP22-104").stats("BP22-104")).toEqual([2, 3]);
  });

  it("106 砕氷の聖獣 — Ward; your followers have Rush; a follower of yours attacking: leader +2", () => {
    const t = d({ me: { field: ["BP22-106", "V1"], leaderDefense: 10 }, opp: { field: [{ card: "V3", engaged: true }] } });
    expect([t.keywords("V1"), t.keywords("BP22-106")]).toEqual([["rush"], ["ward", "rush"]]);
    t.attack("V1", "opp:V3");
    expect(t.leader()).toBe(12);
  });

  it("107 温情のラビットヒーラー — Fanfare: +1/+1 to a Beast follower of yours; act (4): +4/+4", () => {
    const t = d({ me: { hand: ["BP22-107"], field: ["BP22-104"], playPoints: 5 } }).play("BP22-107").pick("BP22-107");
    expect(t.stats("BP22-107")).toEqual([2, 2]);
    t.activate("BP22-107").pick("BP22-104");
    expect(t.stats("BP22-104")).toEqual([6, 7]);
  });

  it("108 コンス — Fanfare, pay 2 and bury an amulet: destroy, +2/+2", () => {
    const t = d({ me: { hand: ["BP22-108"], field: ["AMULET"], playPoints: 5 }, opp: { field: ["V5", "V3"] } }).play("BP22-108").yes().pick("opp:V5");
    expect([t.field(), t.field("opp"), t.stats("BP22-108"), t.pp()]).toEqual([["BP22-108"], ["V3"], [5, 5], 0]);
  });

  it("109 禁じられた儀式 — Fanfare: destroy; your end phase: 2 to your leader", () => {
    const t = d({ me: { hand: ["BP22-109"], playPoints: 2 }, opp: { field: ["V5", "V3"], deck: ["V1"] } }).play("BP22-109").pick("opp:V5");
    expect(t.field("opp")).toEqual(["V3"]);
    expect(t.end().leader()).toBe(18);
  });

  it("T01 聖女の号令 — Storm to up to 2 Ward followers of yours", () => {
    const t = d({ me: { ex: ["BP22-T01"], field: ["WARD", "BP22-093", "V1"], playPoints: 1 } }).play("BP22-T01@ex").pick("WARD", "BP22-093");
    expect([t.keywords("WARD"), t.keywords("BP22-093"), t.keywords("V1")]).toEqual([["ward", "storm"], ["ward", "storm"], []]);
  });
});
