import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP06 Havencraft (090–106). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5; WARD 2c 1/3 Ward;
// AMULET a 1-cost amulet; QUICK-SAC destroys a follower of yours (0). BP01-T16 Holy Falcon and
// BP05-T05 Mystic Artifact are tokens.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP06 Havencraft", () => {
  it("090 Wilbert — Ward; summon a Ward follower costing 5 or less, not Wilbert, from the top 5; Ward followers dying hit for 1", () => {
    const t = d({ me: { hand: ["BP06-090"], deck: ["BP06-090", "WARD", "V1", "BP06-097", "V2"], playPoints: 5 } });
    t.play("BP06-090").none().pick("BP06-097").none().order();
    expect(t.field()).toEqual(["BP06-090", "BP06-097"]);
  });

  it("091 / 092 Karula — end phase: 2 to the enemy leader at 2 PP, draw at 4, destroy the selected follower at 6; evolved recovers 2 first", () => {
    const t = d({ me: { field: ["BP06-091"], deck: ["V1"], playPoints: 6 }, opp: { field: ["V5"], deck: ["V1"] } }).end().pick("opp:V5");
    expect([t.leader("opp"), t.hand(), t.field("opp")]).toEqual([18, ["V1"], []]);
    const low = d({ me: { field: ["BP06-091"], deck: ["V1"], playPoints: 3 }, opp: { field: ["V5"], deck: ["V1"] } }).end();
    expect([low.leader("opp"), low.hand(), low.field("opp")]).toEqual([18, [], ["V5"]]);
    const evo = d({
      me: { field: [{ card: "BP06-091", evolvedInto: "BP06-092" }], deck: ["V1"], playPoints: 4, maxPlayPoints: 6 },
      opp: { field: ["V5"], deck: ["V1"] },
    }).end().pick("opp:V5");
    expect([evo.leader("opp"), evo.hand(), evo.field("opp")]).toEqual([18, ["V1"], []]);
  });

  it("093 Saintly Leader — Ward; engage and banish 3 Ward followers from the cemetery: banish an enemy follower", () => {
    const t = d({ me: { field: ["BP06-093"], cemetery: ["WARD", "WARD", "BP06-097", "V1"] }, opp: { field: ["V5"] } }).activate("BP06-093");
    expect([t.zone("opp", "banished"), t.cemetery()]).toEqual([["V5"], ["V1"]]);
    expect(d({ me: { field: ["BP06-093"], cemetery: ["WARD", "WARD", "V1"] }, opp: { field: ["V5"] } }).canActivate("BP06-093")).toBe(false);
  });

  it("094 / 095 Phantom Blade Wielder — end phase with 2 PP: 2 damage; evolved: 2 damage", () => {
    expect(d({ me: { field: ["BP06-094"] }, opp: { field: ["V5"], deck: ["V1"] } }).end().stats("opp:V5")).toEqual([5, 3]);
    expect(d({ me: { field: ["BP06-094"], playPoints: 1 }, opp: { field: ["V5"], deck: ["V1"] } }).end().stats("opp:V5")).toEqual([5, 5]);
    const evo = d({ me: { field: ["BP06-094"], evolveDeck: ["BP06-095"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP06-094");
    expect(evo.stats("opp:V5")).toEqual([5, 3]);
  });

  it("096 Manifest Devotion — summon up to one amulet costing 5 or less and one costing 3 or less from the top 7", () => {
    const deck = ["BP06-100", "AMULET", "V1", "BP06-121", "V2", "V3", "V5", "V1"];
    const t = d({ me: { hand: ["BP06-096"], deck, playPoints: 5 } }).play("BP06-096").pick("BP06-100").pick("BP06-121").order();
    expect(t.field()).toEqual(["BP06-100", "BP06-121", "BP01-T16"]);
  });

  it("097 / 098 Holy Lancer — Ward; 3 damage with another Ward follower; evolved: 4 damage", () => {
    const t = d({ me: { hand: ["BP06-097"], field: ["WARD"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP06-097").none();
    expect(t.stats("opp:V5")).toEqual([5, 2]);
    const alone = d({ me: { hand: ["BP06-097"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP06-097").none();
    expect(alone.stats("opp:V5")).toEqual([5, 5]);
    const evo = d({ me: { field: ["BP06-097"], evolveDeck: ["BP06-098"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP06-097");
    expect(evo.stats("opp:V5")).toEqual([5, 1]);
  });

  it("099 Boost Kicker — pay X for X damage to each enemy follower; recover 1 at your end phase", () => {
    const t = d({ me: { hand: ["BP06-099"], playPoints: 5 }, opp: { field: ["V1", "V5"] } }).play("BP06-099").yes().choose("2");
    expect([t.field("opp"), t.stats("opp:V5"), t.pp()]).toEqual([["V5"], [5, 3], 1]);
    const end = d({ me: { field: ["BP06-099"], playPoints: 0 }, opp: { deck: ["V1"] } }).end();
    expect(end.pp()).toBe(1);
  });

  it("100 Feather Sanctuary — a Holy Falcon; engage and bury an amulet (itself too): another", () => {
    const t = d({ me: { hand: ["BP06-100"], playPoints: 5 } }).play("BP06-100");
    expect(t.field()).toEqual(["BP06-100", "BP01-T16"]);
    t.activate("BP06-100");
    expect(t.field()).toEqual(["BP01-T16", "BP01-T16"]);
  });

  it("101 Winged Staff Priestess — Ward; Last Words: search another", () => {
    const t = d({ me: { field: ["BP06-101"], hand: ["QUICK-SAC"], deck: ["V1", "BP06-101"] } }).play("QUICK-SAC").pick("BP06-101");
    expect(t.hand()).toEqual(["BP06-101"]);
  });

  it("102 Gravity Grappler — end phase with 2 PP: a Mystic Artifact", () => {
    const t = d({ me: { field: ["BP06-102"], deck: ["V1"] }, opp: { deck: ["V1"] } }).end().none().none();
    expect([t.field(), t.hand()]).toEqual([["BP06-102", "BP05-T05"], ["V1"]]);
  });

  it("103 / 104 Barrage Brawler — evolve by discarding; end phase with 2 PP: 1 to the enemy leader; evolved recovers 2", () => {
    expect(d({ me: { field: ["BP06-103"] }, opp: { deck: ["V1"] } }).end().leader("opp")).toBe(19);
    const evo = d({ me: { field: ["BP06-103"], evolveDeck: ["BP06-104"], hand: ["V1"], playPoints: 1, maxPlayPoints: 5 } }).evolve("BP06-103");
    expect([evo.pp(), evo.cemetery()]).toEqual([3, ["V1"]]);
  });

  it("105 Holy Counterattack — only in the opponent's turn: 2 damage to an engaged enemy, 4 with a Ward follower of yours", () => {
    expect(d({ me: { hand: ["BP06-105"] }, opp: { field: [{ card: "V5", engaged: true }] } }).canPlay("BP06-105")).toBe(false);
    const t = d({ me: { hand: ["BP06-105"], field: ["WARD"], deck: ["V1"] }, opp: { field: ["V5"], deck: ["V1"] } }).end().none();
    t.attack("opp:V5", "leader").quick("BP06-105");
    expect(t.stats("opp:V5")).toEqual([5, 1]);
  });

  it("106 Focus — only in the opponent's turn; with 2 PP: leader +1 and draw", () => {
    // Played in the opponent's end phase; the turn then passes and your start phase draws too.
    const t = d({ me: { hand: ["BP06-106"], deck: ["V1", "V2"], playPoints: 2 }, opp: { deck: ["V1"] } }).end().end().quick("BP06-106");
    expect([t.leader(), t.hand()]).toEqual([21, ["V1", "V2"]]);
    const poor = d({ me: { hand: ["BP06-106"], deck: ["V1", "V2"], playPoints: 1 }, opp: { deck: ["V1"] } }).end().end().quick("BP06-106");
    expect([poor.leader(), poor.hand()]).toEqual([20, ["V1"]]);
  });
});
