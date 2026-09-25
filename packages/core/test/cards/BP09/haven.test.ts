import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP09 Havencraft (086–102). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5; QUICK-SAC destroys a follower of
// yours (0); AMULET is a 1-cost amulet. BP01-135 Prism Priestess (1c 1/1) and BP01-146 Snake Priestess
// (1c 1/3, Ward) are Havencraft followers; BP02-100 Frog Cleric (2c) is a Faith follower whose Fanfare
// gives your leader +2.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP09 Havencraft", () => {
  it("086 / 087 Jeanne — draw, and +1/+1 and Storm with 2 Jeanne followers in the cemetery; evolved summons a Havencraft follower costing 2 or less from hand; Strike +1 attack to one", () => {
    const t = d({ me: { hand: ["BP09-086"], cemetery: ["BP09-086", "BP09-086"], deck: ["V1"] } }).play("BP09-086");
    expect([t.hand(), t.stats("BP09-086"), t.keywords("BP09-086")]).toEqual([["V1"], [3, 4], ["storm"]]);
    expect(d({ me: { hand: ["BP09-086"], cemetery: ["BP09-086"], deck: ["V1"] } }).play("BP09-086").stats("BP09-086")).toEqual([2, 3]);
    const evo = d({ me: { field: ["BP09-086"], evolveDeck: ["BP09-087"], hand: ["BP01-146", "V1"] } }).evolve("BP09-086").pick("BP01-146").none();
    expect([evo.field(), evo.hand()]).toEqual([["BP09-086", "BP01-146"], ["V1"]]);
    const strike = d({ me: { field: [{ card: "BP09-086", evolvedInto: "BP09-087" }, "BP01-135"] }, opp: { field: [{ card: "V1", engaged: true }] } });
    strike.attack("BP09-086", "opp:V1");
    expect(strike.stats("BP01-135")).toEqual([2, 1]);
  });

  it("088 Tutankhamun — Ward; draw, then a card from hand to the bottom; Last Words, pay 1: summon another Tutankhamun engaged", () => {
    const t = d({ me: { hand: ["BP09-088", "V1"], deck: ["V3", "BP09-088"], playPoints: 4 } }).play("BP09-088").none().pick("V1");
    expect([t.hand(), t.zone("me", "deck")]).toEqual([["V3"], ["BP09-088", "V1"]]);
    const lw = d({ me: { field: ["BP09-088"], hand: ["QUICK-SAC"], deck: ["V1", "BP09-088"], playPoints: 1 } }).play("QUICK-SAC").yes().pick("BP09-088");
    expect([lw.field(), lw.engaged("BP09-088"), lw.pp()]).toEqual([["BP09-088"], true, 0]);
  });

  it("089 / 090 Ceryneian Hind — an amulet from the top 5; Lighthind: Ward, bury an amulet: leader +4", () => {
    const t = d({ me: { hand: ["BP09-089"], deck: ["V1", "AMULET", "V3"], playPoints: 4 } }).play("BP09-089").pick("AMULET").order();
    expect(t.hand()).toEqual(["AMULET"]);
    const evo = d({ me: { field: ["BP09-089", "AMULET"], evolveDeck: ["BP09-090"] } }).evolve("BP09-089", { into: "BP09-090" }).yes();
    expect([evo.leader(), evo.cemetery(), evo.keywords("BP09-089")]).toEqual([24, ["AMULET"], ["ward"]]);
  });

  it("090_back Ceryneian Darkhind — Bane; bury an amulet: 4 damage to an enemy leader or follower", () => {
    const t = d({ me: { field: ["BP09-089", "AMULET"], evolveDeck: ["BP09-090"] }, opp: { field: ["V5"] } });
    t.evolve("BP09-089", { into: "BP09-090_back" }).yes().pick("opp:V5");
    expect([t.stats("opp:V5"), t.keywords("BP09-089"), t.cemetery()]).toEqual([[5, 1], ["bane"], ["AMULET"]]);
    // Without an amulet nothing is asked.
    const none = d({ me: { field: ["BP09-089"], evolveDeck: ["BP09-090"] }, opp: { field: ["V5"] } }).evolve("BP09-089", { into: "BP09-090_back" });
    expect(none.stats("opp:V5")).toEqual([5, 5]);
  });

  it("091 Heavenly Knight — Storm, Ward; with 2 amulets on your field +2 attack and leader +2", () => {
    const t = d({ me: { hand: ["BP09-091"], field: ["AMULET", "AMULET"], playPoints: 5 } }).play("BP09-091").none();
    expect([t.stats("BP09-091"), t.leader(), t.keywords("BP09-091")]).toEqual([[5, 7], 22, ["storm", "ward"]]);
    const one = d({ me: { hand: ["BP09-091"], field: ["AMULET"], playPoints: 5 } }).play("BP09-091").none();
    expect([one.stats("BP09-091"), one.leader()]).toEqual([[3, 7], 20]);
  });

  it("092 Tenko's Shrine — when your leader gains defense, engage it: 2 damage to an enemy leader or follower", () => {
    const t = d({ me: { field: ["BP09-092"], hand: ["BP02-100"] }, opp: { field: ["V5"] } }).play("BP02-100").yes().pick("opp:V5");
    expect([t.stats("opp:V5"), t.engaged("BP09-092"), t.leader()]).toEqual([[5, 3], true, 22]);
  });

  it("093 / 094 Jeweled Priestess — evolved: may summon an amulet costing 2 or less from hand; once per turn an amulet entering gives leader +1", () => {
    const t = d({ me: { field: ["BP09-093"], evolveDeck: ["BP09-094"], hand: ["AMULET", "AMULET"] } }).evolve("BP09-093").pick("AMULET");
    expect([t.field(), t.leader()]).toEqual([["BP09-093", "AMULET"], 21]);
    t.play("AMULET");
    expect(t.leader()).toBe(21);
  });

  it("095 Whitefang Temple — end phase: a prayer counter and leader +1; with 3 counters at your main phase: bury it and summon a Faith follower costing 4 or less", () => {
    const t = d({ me: { field: [{ card: "BP09-095", counters: { prayer: 2 } }], deck: ["V1", "BP02-100"] }, opp: { deck: ["V1"] } });
    t.end();
    expect([t.counters("BP09-095", "prayer"), t.leader()]).toEqual([3, 21]);
    t.end().pick("BP02-100");
    expect([t.field(), t.cemetery(), t.leader()]).toEqual([["BP02-100"], ["BP09-095"], 23]);
  });

  it("096 Opposing Statues — summons a Holy Fowl of Ivory; bury another amulet: a Hexed Fowl of Ebon too", () => {
    const one = d({ me: { hand: ["BP09-096"], deck: ["BP09-099", "V1"], playPoints: 4 } }).play("BP09-096").flush().pick("BP09-099").none().flush();
    expect([one.field(), one.leader()]).toEqual([["BP09-096", "BP09-099"], 22]);
    const both = d({ me: { hand: ["BP09-096"], field: ["AMULET"], deck: ["BP09-100", "V1"], playPoints: 4 } });
    both.play("BP09-096").pending().yes().pick("BP09-100").flush();
    expect([both.field(), both.cemetery(), both.leader("opp")]).toEqual([["BP09-096", "BP09-100"], ["AMULET"], 18]);
  });

  it("097 / 098 Lycaon — discard an amulet: 5 damage and a draw (not played without a target)", () => {
    const t = d({ me: { hand: ["BP09-097", "AMULET"], deck: ["V1"], playPoints: 6 }, opp: { field: ["V5"] } }).play("BP09-097").yes();
    expect([t.field("opp"), t.hand(), t.cemetery()]).toEqual([[], ["V1"], ["AMULET"]]);
    const none = d({ me: { hand: ["BP09-097", "AMULET"], deck: ["V1"], playPoints: 6 } }).play("BP09-097");
    expect(none.hand()).toEqual(["AMULET"]);
    const evo = d({ me: { field: ["BP09-097"], evolveDeck: ["BP09-098"], hand: ["AMULET"], deck: ["V1"] }, opp: { field: ["V5"] } }).evolve("BP09-097").yes();
    expect([evo.field("opp"), evo.hand()]).toEqual([[], ["V1"]]);
  });

  it("099 / 100 Holy Fowl and Hexed Fowl — with an amulet on your field: leader +2 / 2 damage to each enemy leader", () => {
    expect(d({ me: { hand: ["BP09-099"], field: ["AMULET"] } }).play("BP09-099").none().leader()).toBe(22);
    expect(d({ me: { hand: ["BP09-099"] } }).play("BP09-099").none().leader()).toBe(20);
    const hexed = d({ me: { hand: ["BP09-100"], field: ["AMULET"] } }).play("BP09-100");
    expect([hexed.leader("opp"), hexed.keywords("BP09-100")]).toEqual([18, ["rush"]]);
  });

  it("101 Deathscythe Nun — Bane; another Havencraft follower gets Bane", () => {
    const t = d({ me: { hand: ["BP09-101"], field: ["BP01-135", "V1"] } }).play("BP09-101");
    expect([t.keywords("BP01-135"), t.keywords("V1"), t.keywords("BP09-101")]).toEqual([["bane"], [], ["bane"]]);
  });

  it("102 Moriae Encomium — draw; Last Words: destroy an enemy follower with 3 defense or less", () => {
    expect(d({ me: { hand: ["BP09-102"], deck: ["V1"] } }).play("BP09-102").hand()).toEqual(["V1"]);
    // Buried by Ceryneian Lighthind's On Evolve cost: put into the cemetery from the field (CR 12.5.3).
    const t = d({ me: { field: ["BP09-089", "BP09-102"], evolveDeck: ["BP09-090"] }, opp: { field: ["V1", "V5"] } });
    t.evolve("BP09-089", { into: "BP09-090" }).yes();
    expect(t.field("opp")).toEqual(["V5"]);
  });
});
