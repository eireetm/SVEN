import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP13 Havencraft (088–104). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); AMULET a 1-cost
// amulet. Faith followers: BP13-091 Lunerian Paladin (1/1), BP13-103 Sacred Groundskeeper (0/5, Ward, also a
// Beast), BP13-095 Pyne (1-cost, Ward). BP13-104 Sealed Tome is a 1-cost amulet (Last Words: leader +1, draw).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP13 Havencraft", () => {
  it("088 / 089 Jeanne — Fanfare: leader -2 to destroy an enemy follower that costs 2 or less; evolved: 3 to each enemy leader and follower, leader +3", () => {
    const t = d({ me: { hand: ["BP13-088"], playPoints: 2 }, opp: { field: ["V2", "V3"] } }).play("BP13-088").yes();
    expect([t.field("opp"), t.leader()]).toEqual([["V3"], 18]);
    expect(d({ me: { hand: ["BP13-088"], playPoints: 2 }, opp: { field: ["V2"] } }).play("BP13-088").no().field("opp")).toEqual(["V2"]);
    expect(d({ me: { hand: ["BP13-088"], playPoints: 2 }, opp: { field: ["V3"] } }).play("BP13-088").leader()).toBe(20);
    const evo = d({ me: { field: ["BP13-088"], evolveDeck: ["BP13-089"], playPoints: 5 }, opp: { field: ["V5", "V2"] } }).evolve("BP13-088");
    expect([evo.leader("opp"), evo.field("opp"), evo.stats("opp:V5"), evo.leader()]).toEqual([17, ["V5"], [5, 2], 23]);
  });

  it("090 Jatelant — Fanfare: banish 2 amulets from the cemetery to banish an enemy follower, 3 to its leader, leader +3; act once per turn: bury an amulet to summon a Havencraft follower or amulet (3 or less) from hand", () => {
    const t = d({ me: { hand: ["BP13-090"], cemetery: ["AMULET", "AMULET", "V1"], playPoints: 6 }, opp: { field: ["V5"] } }).play("BP13-090").yes();
    expect([t.zone("me", "banished"), t.zone("opp", "banished"), t.leader("opp"), t.leader()]).toEqual([["AMULET", "AMULET"], ["V5"], 17, 23]);
    const act = d({ me: { field: ["BP13-090", "AMULET", "AMULET"], hand: ["BP13-103", "BP13-093"] } });
    act.activate("BP13-090").pick("AMULET").pick("BP13-103").none();
    expect([act.field(), act.stats("BP13-103"), act.canActivate("BP13-090")]).toEqual([["BP13-090", "AMULET", "BP13-103"], [0, 5], false]);
  });

  it("091 / 092 Lunerian Paladin — Ward; evolved: may summon a follower (2 or less) from the top 4, leader +2 if it has Ward", () => {
    expect(d({ me: { field: ["BP13-091"] } }).keywords("BP13-091")).toEqual(["ward"]);
    const spec: DriveSpec = { me: { field: ["BP13-091"], evolveDeck: ["BP13-092"], deck: ["V3", "BP13-095", "V1", "V5"], playPoints: 1 } };
    const t = d(spec).evolve("BP13-091").pick("BP13-095").none().order();
    expect([t.field(), t.leader(), t.zone("me", "deck")]).toEqual([["BP13-091", "BP13-095"], 22, ["V3", "V1", "V5"]]);
    expect(d(spec).evolve("BP13-091").pick("V1").order().leader()).toBe(20);
  });

  it("093 Absolute Tolerance — 5 less for each: no cards on your field, 2 other cards or less in hand, 15 cards in the cemetery; Fanfare: destroy", () => {
    expect(d({ me: { hand: ["BP13-093"], playPoints: 5 } }).canPlay("BP13-093")).toBe(true);
    expect(d({ me: { hand: ["BP13-093"], playPoints: 4 } }).canPlay("BP13-093")).toBe(false);
    expect(d({ me: { hand: ["BP13-093"], cemetery: n(15), playPoints: 0 } }).canPlay("BP13-093")).toBe(true);
    const busy = (pp: number): DriveSpec => ({ me: { hand: ["BP13-093", ...n(3)], field: ["V1"], cemetery: n(15), playPoints: pp } });
    expect([d(busy(10)).canPlay("BP13-093"), d(busy(9)).canPlay("BP13-093")]).toEqual([true, false]);
    expect(d({ me: { hand: ["BP13-093"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP13-093").field("opp")).toEqual([]);
  });

  it("094 Westmuenster Abbey — during your turn, a follower that costs 2 or less put onto your field: 1 damage to an enemy leader or follower", () => {
    const t = d({ me: { field: ["BP13-094"], hand: ["V1", "V2", "V3"], playPoints: 6 }, opp: { field: ["V5"] } });
    t.play("V1").pick("opp:V5").play("V2").pick("opp:leader").play("V3");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 4], 19]);
  });

  it("095 / 096 Pyne — Ward; evolved: up to 2 enemy followers don't refresh during the next start phase", () => {
    const t = d({
      me: { field: ["BP13-095"], evolveDeck: ["BP13-096"], deck: n(3), playPoints: 2 },
      opp: { field: [{ card: "V5", engaged: true }, { card: "V3", engaged: true }], deck: n(3) },
    });
    t.evolve("BP13-095").pick("opp:V5").end().none();
    expect([t.engaged("opp:V5"), t.engaged("opp:V3")]).toEqual([true, false]);
  });

  it("097 Thornclad Arbiter — Ward; Fanfare: may summon an amulet (2 or less) from the top 5; act: destroy an amulet on your field", () => {
    const t = d({ me: { hand: ["BP13-097"], deck: ["V1", "V5", "BP13-104", "V2", "V3", "V2"], playPoints: 3 } }).play("BP13-097").none().pick("BP13-104").order();
    expect([t.field(), t.zone("me", "deck")]).toEqual([["BP13-097", "BP13-104"], ["V2", "V1", "V5", "V2", "V3"]]);
    const act = d({ me: { field: ["BP13-097", "BP13-104"], deck: ["V1"] } }).activate("BP13-097");
    expect([act.field(), act.leader(), act.hand(), act.engaged("BP13-097")]).toEqual([["BP13-097"], 21, ["V1"], true]);
    expect(d({ me: { field: ["BP13-097"] } }).canActivate("BP13-097")).toBe(false);
  });

  it("098 Gods' Loving Smite — 3 damage, 5 if an amulet was buried for it", () => {
    expect(d({ me: { hand: ["BP13-098"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP13-098").stats("opp:V5")).toEqual([5, 2]);
    const t = d({ me: { hand: ["BP13-098"], field: ["AMULET"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP13-098").choose("bury");
    expect([t.field("opp"), t.cemetery()]).toEqual([[], ["AMULET", "BP13-098"]]);
  });

  it("099 / 100 Charitable Al-mi'raj — Ward; evolved: a Beast card from the top 4 to the hand", () => {
    const t = d({ me: { field: ["BP13-099"], evolveDeck: ["BP13-100"], deck: ["V1", "BP13-103", "V2", "V3"], playPoints: 1 } }).evolve("BP13-099").pick("BP13-103").order();
    expect([t.hand(), t.keywords("BP13-099")]).toEqual([["BP13-103"], ["ward"]]);
  });

  it("101 Prismawing Featherfolk — Fanfare: discard a card to take a spell or amulet from the top 4", () => {
    const t = d({ me: { hand: ["BP13-101", "V1"], deck: ["V2", "BP13-098", "BP13-104", "V3"], playPoints: 2 } }).play("BP13-101").yes().pick("BP13-104").order();
    expect([t.hand(), t.cemetery()]).toEqual([["BP13-104"], ["V1"]]);
  });

  it("102 Turquoise Sister — Ward; Fanfare: summon a Faith follower with 2 attack or less from the deck", () => {
    const t = d({ me: { hand: ["BP13-102"], deck: ["BP13-093", "BP13-091", "BP13-103", "V1"], playPoints: 7 } });
    t.play("BP13-102").none().pick("BP13-103").none();
    // Groundskeeper came from the deck: its Fanfare gives it +2.
    expect([t.field(), t.stats("BP13-103")]).toEqual([["BP13-102", "BP13-103"], [2, 5]]);
  });

  it("103 Sacred Groundskeeper — Ward; Fanfare: +2 attack unless it came from the hand (the EX area counts — ruling)", () => {
    expect(d({ me: { hand: ["BP13-103"], playPoints: 2 } }).play("BP13-103").none().stats("BP13-103")).toEqual([0, 5]);
    expect(d({ me: { ex: ["BP13-103"], playPoints: 2 } }).play("BP13-103@ex").none().stats("BP13-103")).toEqual([2, 5]);
  });

  it("104 Sealed Tome — act (5), engage and bury it: destroy an enemy follower; Last Words: leader +1, draw", () => {
    const t = d({ me: { field: ["BP13-104"], deck: ["V1"], playPoints: 5 }, opp: { field: ["V5"] } }).activate("BP13-104");
    expect([t.field("opp"), t.leader(), t.hand(), t.pp()]).toEqual([[], 21, ["V1"], 0]);
    expect(d({ me: { field: ["BP13-104"], playPoints: 4 }, opp: { field: ["V5"] } }).canActivate("BP13-104")).toBe(false);
  });
});
