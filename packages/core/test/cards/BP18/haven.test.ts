import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP18 Havencraft (097–115, T08, T09). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); WARD (2) is a 1/3 Ward follower;
// QUICK-SAC (0) destroys one of your followers. BP18-005 is a 2-cost Togh Keyoh follower; BP02-095 Elana's Prayer.
// Tokens: BP18-T08 Righteous Conviction, BP18-T09 Totem of Madness.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const CONVICTION = "BP18-T08";
const TOTEM = "BP18-T09";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("BP18 Havencraft", () => {
  it("097 / 098 Seishiro, Admonishing Faith — whenever your leader gains defense: 2 damage; evolved: a small Togh Keyoh follower or Havencraft amulet from the hand; super-evolved: a Righteous Conviction", () => {
    const t = d({ me: { field: ["BP18-097"], hand: ["BP18-107"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP18-107");
    expect(t.stats("opp:V5")).toEqual([5, 3]);
    const e = d({ me: { field: ["BP18-097"], evolveDeck: ["BP18-098"], hand: ["BP18-005"], playPoints: 1, ...SUPER } });
    e.evolve("BP18-097", { sep: true }).flush().pick("BP18-005").flush();
    expect([e.field(), e.ex()]).toEqual([["BP18-097", "BP18-005"], [CONVICTION]]);
  });

  it("099 Tenmei, Insatiable Adjudicator — act (0) once per turn: damage per Togh Keyoh follower to the enemy leader, leader +1", () => {
    const t = d({ me: { field: ["BP18-099", "BP18-005"] }, opp: { field: ["V5"] } }).activate("BP18-099");
    expect([t.leader("opp"), t.leader(), t.stats("opp:V5"), t.canActivate("BP18-099")]).toEqual([18, 21, [5, 3], false]);
  });

  it("100 Elana, Purest Prayer — Ward; Fanfare: an Elana's Prayer from the deck; at the opponent's main phase with the Prayer: leader +2", () => {
    expect(d({ me: { hand: ["BP18-100"], deck: ["V1", "BP02-095"], playPoints: 2 } }).play("BP18-100").none().pick("BP02-095").hand()).toEqual(["BP02-095"]);
    // The Ward follower may be engaged at the end phase (CR 12.8.2): not here.
    expect(d({ me: { field: ["BP18-100", "BP02-095"] }, opp: { deck: ["V1", "V3"] } }).end().none().flush().leader()).toBe(22);
  });

  it("101 / 102 Conferrer of Vows — Fanfare, (2): a Togh Keyoh follower (4 or less) from the cemetery, not another Conferrer; evolved: leader +2", () => {
    const t = d({ me: { hand: ["BP18-101"], cemetery: ["BP18-005", "BP18-101"], playPoints: 5 } }).play("BP18-101").yes();
    expect([t.field(), t.pp()]).toEqual([["BP18-101", "BP18-005"], 0]);
    expect(d({ me: { field: ["BP18-101"], evolveDeck: ["BP18-102"], playPoints: 1 } }).evolve("BP18-101").leader()).toBe(22);
  });

  it("103 Imina, Mad Eidolon — Bane; Fanfare: each player summons a Totem of Madness", () => {
    const t = d({ me: { hand: ["BP18-103"], playPoints: 4 } }).play("BP18-103");
    expect([t.field(), t.field("opp"), t.keywords("BP18-103")]).toEqual([["BP18-103", TOTEM], [TOTEM], ["bane"]]);
  });

  it("104 Unshakable Prayer — Fanfare: a Togh Keyoh card and a Seishiro from the top 4, the next Togh Keyoh card 2 less; act (1), engage and bury it: leader +1", () => {
    const t = d({ me: { hand: ["BP18-104"], deck: ["BP18-005", "BP18-104", "BP18-097", "V1"], playPoints: 5 } });
    t.play("BP18-104").pick("BP18-005").pick("BP18-097").order();
    expect(t.hand()).toEqual(["BP18-005", "BP18-097"]);
    expect(t.play("BP18-097").pp()).toBe(1);
    expect(d({ me: { field: ["BP18-104"], playPoints: 1 } }).activate("BP18-104").leader()).toBe(21);
  });

  it("105 / 106 Deliverer of Punishment — Fanfare: leader +1, evolve with a Seishiro; evolved: leader +1", () => {
    const t = d({ me: { field: ["BP18-097"], hand: ["BP18-105"], evolveDeck: ["BP18-106"], playPoints: 1 } }).play("BP18-105").flush().yes().flush();
    expect([t.leader(), t.game.reader().info(t.id("BP18-105")).evolved]).toEqual([22, true]);
  });

  it("107 / 108 Lorena, Iron-Willed Priest — Fanfare: leader +4; evolved: damage equal to its attack", () => {
    expect(d({ me: { hand: ["BP18-107"], playPoints: 4 } }).play("BP18-107").leader()).toBe(24);
    expect(d({ me: { field: ["BP18-107"], evolveDeck: ["BP18-108"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP18-107").stats("opp:V5")).toEqual([5, 1]);
  });

  it("109 Guiding Words — draw; leader +1 with a Togh Keyoh follower", () => {
    const t = d({ me: { hand: ["BP18-109"], field: ["BP18-005"], deck: ["V1"], playPoints: 1 } }).play("BP18-109");
    expect([t.hand(), t.leader()]).toEqual([["V1"], 21]);
    expect(d({ me: { hand: ["BP18-109"], deck: ["V1"], playPoints: 1 } }).play("BP18-109").leader()).toBe(20);
  });

  it("110 / 111 Votary of Contemplation — Fanfare: leader +1 and draw with a Seishiro; evolved: 2 damage, 2 to its leader after your leader gained defense", () => {
    const t = d({ me: { hand: ["BP18-110"], field: ["BP18-097"], deck: ["V1"], playPoints: 2 } }).play("BP18-110").flush();
    expect([t.leader(), t.hand()]).toEqual([21, ["V1"]]);
    const e = d({ me: { field: ["BP18-110"], evolveDeck: ["BP18-111"], hand: ["BP18-109"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } });
    e.play("BP18-109").evolve("BP18-110");
    expect([e.stats("opp:V5"), e.leader("opp")]).toEqual([[5, 3], 18]);
    const no = d({ me: { field: ["BP18-110"], evolveDeck: ["BP18-111"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP18-110");
    expect(no.leader("opp")).toBe(20);
  });

  it("112 Mugnier, Purifying Light — Fanfare: banish an enemy follower that costs 3 or less", () => {
    const t = d({ me: { hand: ["BP18-112"], playPoints: 4 }, opp: { field: ["V5", "V3"] } }).play("BP18-112");
    expect([t.field("opp"), t.zone("opp", "banished")]).toEqual([["V5"], ["V3"]]);
  });

  it("113 Armed Al-mi'raj — Fanfare: destroy an enemy follower and leader +3", () => {
    const t = d({ me: { hand: ["BP18-113"], playPoints: 6 }, opp: { field: ["V5"] } }).play("BP18-113");
    expect([t.field("opp"), t.leader()]).toEqual([[], 23]);
  });

  it("114 Heavenly Hound — Ward; Fanfare: +0/+1 with another Ward follower", () => {
    expect(d({ me: { hand: ["BP18-114"], field: ["WARD"], playPoints: 2 } }).play("BP18-114").none().stats("BP18-114")).toEqual([3, 3]);
    expect(d({ me: { hand: ["BP18-114"], playPoints: 2 } }).play("BP18-114").none().stats("BP18-114")).toEqual([3, 2]);
  });

  it("115 Golden Bell — Fanfare: draw; act (2), engage: bury this; Last Words: leader +1", () => {
    expect(d({ me: { hand: ["BP18-115"], deck: ["V1"], playPoints: 1 } }).play("BP18-115").hand()).toEqual(["V1"]);
    const t = d({ me: { field: ["BP18-115"], playPoints: 2 } }).activate("BP18-115");
    expect([t.field(), t.leader()]).toEqual([[], 21]);
  });

  it("T08 Righteous Conviction — damage per Togh Keyoh follower to the enemy leader, leader +1", () => {
    const t = d({ me: { ex: [CONVICTION], field: ["BP18-005", "BP18-099"], playPoints: 1 } }).play(`${CONVICTION}@ex`).flush();
    expect([t.leader("opp"), t.leader()]).toEqual([18, 21]);
  });

  it("T09 Totem of Madness — end phase: a curse counter; 1: 1 to your leader, 2: discard, 3: discard, 3 to your leader and bury it", () => {
    const one = d({ me: { field: [TOTEM], hand: ["V1"] }, opp: { deck: ["V1"] } }).end().flush();
    expect([one.leader(), one.counters(TOTEM, "curse")]).toEqual([19, 1]);
    const two = d({ me: { field: [{ card: TOTEM, counters: { curse: 1 } }], hand: ["V1"] }, opp: { deck: ["V1"] } }).end().flush();
    expect([two.cemetery(), two.leader()]).toEqual([["V1"], 20]);
    const three = d({ me: { field: [{ card: TOTEM, counters: { curse: 2 } }], hand: ["V1"] }, opp: { deck: ["V1"] } }).end().flush();
    expect([three.cemetery(), three.leader(), three.field()]).toEqual([["V1"], 17, []]);
  });
});
