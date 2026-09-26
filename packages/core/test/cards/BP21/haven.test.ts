import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP21 Havencraft (091–109, T08–T10). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). Academic (学院): BP21-091 Verdilia (1c
// 1/1, Ward), BP21-096 Lou (1c 1/1), BP21-098 Kira (1c 1/2, Ward; act, engage: leader +1 with another Academic follower),
// BP21-103 (2c 2/3, the same act). BP21-020 (Swordcraft; Fanfare (2): a 2-cost or less Academic follower from the deck).
// BUFF-SOME (0): up to 2 followers of yours +1/+1 this turn; BOTH-20 (0): 20 ability damage to each leader. Tokens: BP21-T08
// Holy Cavalier, BP21-T09 Cyclical Guidance, BP21-T10 Crest: Wilbert.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("BP21 Havencraft", () => {
  it("091 / 092 Verdilia, Rogue Professor — Ward; Fanfare by an ability: 2 damage; evolved: leader +1 and draw; super-evolved: a Cyclical Guidance", () => {
    const t = d({ me: { hand: ["BP21-020"], deck: ["BP21-091"], playPoints: 6 }, opp: { field: ["V5"] } }).play("BP21-020").yes().pick("BP21-091").none();
    expect(t.stats("opp:V5")).toEqual([5, 3]);
    expect(d({ me: { hand: ["BP21-091"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP21-091").none().stats("opp:V5")).toEqual([5, 5]);
    const e = d({ me: { field: ["BP21-091"], evolveDeck: ["BP21-092"], deck: ["V1"], playPoints: 1 } }).evolve("BP21-091");
    expect([e.leader(), e.hand()]).toEqual([21, ["V1"]]);
    const s = d({ me: { field: ["BP21-091"], evolveDeck: ["BP21-092"], deck: ["V1"], playPoints: 1, ...SUPER } }).evolve("BP21-091", { sep: true }).flush();
    expect(s.ex()).toEqual(["BP21-T09"]);
  });

  it("T09 Cyclical Guidance — 5 damage to up to X enemy followers (X: times your leader gained defense this turn); +1/+1 to your Academic followers", () => {
    const t = d({ me: { ex: ["BP21-T09"], field: ["BP21-098", "BP21-103"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5", "V3", "V1"] } });
    t.activate("BP21-098").activate("BP21-103").play("BP21-T09@ex").pick("opp:V5", "opp:V3").flush();
    expect([t.field("opp"), t.stats("BP21-098"), t.leader()]).toEqual([["V1"], [2, 3], 22]);
  });

  it("093 Elluvia, Graceful Lady — twice per turn, your leader gains defense: +1/+1 to your other followers; Fanfare: an Academic follower costing up to your play points from the hand", () => {
    const t = d({ me: { hand: ["BP21-093", "BP21-098", "BP21-100"], playPoints: 4 } }).play("BP21-093").pick("BP21-098").none();
    expect(t.field()).toEqual(["BP21-093", "BP21-098"]);
    const g = d({ me: { field: ["BP21-093", "BP21-098", "BP21-098", "V1"] } }).activate("BP21-098").activate("BP21-098");
    expect([g.stats("V1"), g.stats("BP21-093"), g.leader()]).toEqual([[4, 4], [3, 3], 22]);
  });

  it("094 / 095 Wilbert, Desolate Paladin / T08 Holy Cavalier — Ward; Fanfare: a Holy Cavalier; evolved: a Holy Cavalier and +1/+0 and Assail to each (Rush when it gains attack), or a Crest: Wilbert", () => {
    expect(d({ me: { hand: ["BP21-094"], playPoints: 3 } }).play("BP21-094").none().none().field()).toEqual(["BP21-094", "BP21-T08"]);
    const e = d({ me: { field: ["BP21-094", "BP21-T08"], evolveDeck: ["BP21-095"], playPoints: 1 } }).evolve("BP21-094").choose("cavalier").none().flush();
    expect([e.field(), e.stats("BP21-T08"), e.keywords("BP21-T08")]).toEqual([["BP21-094", "BP21-T08", "BP21-T08"], [2, 2], ["ward", "assail", "rush"]]);
    expect(d({ me: { field: ["BP21-094"], evolveDeck: ["BP21-095"], playPoints: 1 } }).evolve("BP21-094").choose("crest").ex()).toEqual(["BP21-T10"]);
  });

  it("T10 Crest: Wilbert, Desolate Paladin — act (0) once per turn: +1/+1 to a Ward follower with 3 Ward followers, +2/+2 with 5", () => {
    const t = d({ me: { ex: ["BP21-T10"], field: ["BP21-098", "BP21-098", "BP21-091"] } }).activate("BP21-T10@ex").pick("BP21-091");
    expect([t.stats("BP21-091"), t.canActivate("BP21-T10")]).toEqual([[2, 2], false]);
    const five = d({ me: { ex: ["BP21-T10"], field: ["BP21-098", "BP21-098", "BP21-098", "BP21-098", "BP21-091"] } }).activate("BP21-T10@ex").pick("BP21-091");
    expect(five.stats("BP21-091")).toEqual([3, 3]);
    expect(d({ me: { ex: ["BP21-T10"], field: ["BP21-098", "BP21-091"] } }).activate("BP21-T10@ex").pick("BP21-091").stats("BP21-091")).toEqual([1, 1]);
  });

  it("096 / 097 Lou, Lady-in-Training — Fanfare with another Academic follower: leader +1; Evolve only after gaining defense this turn; evolved: damage equal to its attack", () => {
    expect(d({ me: { hand: ["BP21-096"], field: ["BP21-098"], playPoints: 1 } }).play("BP21-096").leader()).toBe(21);
    const t = d({ me: { field: ["BP21-096", "BP21-098", "BP21-093"], evolveDeck: ["BP21-097"], playPoints: 1 }, opp: { field: ["V5"] } });
    expect(t.canEvolve("BP21-096")).toBe(false);
    t.activate("BP21-098");
    expect(t.canEvolve("BP21-096")).toBe(true);
    expect(t.evolve("BP21-096").stats("opp:V5")).toEqual([5, 2]);
  });

  it("098 Kira, Resilient Maiden — Ward; Fanfare (3): Elluvia from the deck; act with another Academic follower: leader +1", () => {
    const t = d({ me: { hand: ["BP21-098"], deck: ["BP21-093", "V1"], playPoints: 4 } }).play("BP21-098").none().yes().pick("BP21-093");
    expect(t.field()).toEqual(["BP21-098", "BP21-093"]);
    expect(d({ me: { field: ["BP21-098", "BP21-096"] } }).activate("BP21-098").leader()).toBe(21);
    expect(d({ me: { field: ["BP21-098", "V1"] } }).canActivate("BP21-098")).toBe(false);
  });

  it("099 Orchid's Examination Hall — act after your leader gained defense: +1/+1 to an Academic follower; act (1), discard an Academic amulet: a 1-cost Academic follower from the deck", () => {
    const t = d({ me: { field: ["BP21-099", "BP21-098", "BP21-096"] } });
    expect(t.canActivate("BP21-099")).toBe(false);
    t.activate("BP21-098").activate("BP21-099").pick("BP21-096");
    expect(t.stats("BP21-096")).toEqual([2, 2]);
    const s = d({ me: { field: ["BP21-099"], hand: ["BP21-099"], deck: ["BP21-096", "V1"], playPoints: 1 } }).activate("BP21-099").pick("BP21-096");
    expect([s.hand(), s.cemetery(), s.canActivate("BP21-099")]).toEqual([["BP21-096"], ["BP21-099"], false]);
  });

  it("100 / 101 Pureflame Lady — gaining defense: 1 to each enemy follower (also by super-evolving, not by evolving); Fanfare with another Academic follower: +1/+1; evolved: +0/+2 to your leader or a follower", () => {
    const t = d({ me: { hand: ["BP21-100"], field: ["BP21-098"], playPoints: 3 }, opp: { field: ["V5", "V1"] } }).play("BP21-100");
    expect([t.stats("opp:V5"), t.stats("opp:V1"), t.stats("BP21-100")]).toEqual([[5, 4], [2, 1], [2, 2]]);
    const e = d({ me: { field: ["BP21-100"], evolveDeck: ["BP21-101"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP21-100").pick("BP21-100");
    expect([e.stats("BP21-100"), e.stats("opp:V5")]).toEqual([[2, 4], [5, 4]]);
    const l = d({ me: { field: ["BP21-100"], evolveDeck: ["BP21-101"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP21-100").pick("leader");
    expect([l.leader(), l.stats("opp:V5")]).toEqual([22, [5, 5]]);
    const s = d({ me: { field: ["BP21-100"], evolveDeck: ["BP21-101"], playPoints: 1, ...SUPER }, opp: { field: ["V5"] } }).evolve("BP21-100", { sep: true });
    s.flush().pick("leader").flush();
    expect(s.stats("opp:V5")).toEqual([5, 4]);
  });

  it("102 Kyrie, Fragment of Hope — Ward; Fanfare: draw, recover 3 play points", () => {
    const t = d({ me: { hand: ["BP21-102"], deck: ["V1"], playPoints: 4, maxPlayPoints: 6 } }).play("BP21-102").none();
    expect([t.hand(), t.pp()]).toEqual([["V1"], 3]);
  });

  it("103 Pureflower Maiden — once per turn, gaining defense: draw", () => {
    const t = d({ me: { field: ["BP21-103"], hand: ["BUFF-SOME", "BUFF-SOME"], deck: ["V1", "V3"] } }).play("BUFF-SOME").pick("BP21-103");
    expect(t.hand()).toEqual(["BUFF-SOME", "V1"]);
    expect(t.play("BUFF-SOME").pick("BP21-103").hand()).toEqual(["V1"]);
  });

  it("104 / 105 Zlatorog — Ward; Fanfare: draw, +2/+2 unless from the hand; evolved: may summon a 5-cost or less Ward follower from the hand", () => {
    const t = d({ me: { hand: ["BP21-104"], deck: ["V1"], playPoints: 5 } }).play("BP21-104").none();
    expect([t.stats("BP21-104"), t.hand()]).toEqual([[4, 4], ["V1"]]);
    expect(d({ me: { ex: ["BP21-104"], deck: ["V1"], playPoints: 5 } }).play("BP21-104@ex").none().stats("BP21-104")).toEqual([6, 6]);
    const e = d({ me: { field: ["BP21-104"], evolveDeck: ["BP21-105"], hand: ["BP21-098", "V1"], playPoints: 2 } }).evolve("BP21-104").pick("BP21-098").none();
    expect(e.field()).toEqual(["BP21-104", "BP21-098"]);
  });

  it("106 Aqua Priestess — Ward; Fanfare: a 5-cost or less spell from the deck into the EX area, 5 less this turn", () => {
    const t = d({ me: { hand: ["BP21-106"], deck: ["BP21-053", "V1"], playPoints: 7 }, opp: { field: ["V5"] } }).play("BP21-106").none().pick("BP21-053");
    expect([t.ex(), t.pp(), t.canPlay("BP21-053@ex")]).toEqual([["BP21-053"], 0, true]);
  });

  it("107 Holy Armored Cheetah — your leader gains defense: Storm", () => {
    expect(d({ me: { field: ["BP21-107", "BP21-098", "BP21-096"] } }).activate("BP21-098").keywords("BP21-107")).toEqual(["storm"]);
  });

  it("108 Hierophant's Implements — act, engage and bury an amulet (this one too): 1 to the enemy leader, leader +1", () => {
    const t = d({ me: { field: ["BP21-108"] } }).activate("BP21-108");
    expect([t.leader("opp"), t.leader(), t.field()]).toEqual([19, 21, []]);
  });

  it("109 Sublime Talisman — your leader takes ability damage, bury this: leader +4 and draw", () => {
    const t = d({ me: { field: ["BP21-109"], hand: ["BOTH-20"], deck: ["V1"], leaderDefense: 40 }, opp: { leaderDefense: 40 } }).play("BOTH-20").yes();
    expect([t.leader(), t.hand(), t.field()]).toEqual([24, ["V1"], []]);
  });
});
