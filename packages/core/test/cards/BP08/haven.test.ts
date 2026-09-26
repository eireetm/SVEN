import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP08 Havencraft (086–102). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5; QUICK-SAC destroys one of your
// followers. Havencraft followers that cost 2: BP08-091 Sekhmet, 093 Colette, 099 Windbear.
// Amulets: BP08-024 Durandal, BP08-102 Forgotten Sanctuary, BP01-T10 Magic Sediment.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const HOLY_TIGER = "BP01-T17";

describe("BP08 Havencraft", () => {
  it("086 Holylord Eachtar — Ward; Fanfare summons up to 2 cheap Havencraft followers; they (and it) have Rush; act: banish 3 for +1/+1, no engage", () => {
    const t = d({ me: { hand: ["BP08-086"], cemetery: ["BP08-093", "BP08-099", "BP08-091"], playPoints: 7 } });
    t.play("BP08-086").none().pick("BP08-093", "BP08-099");
    expect([t.field(), t.keywords("BP08-093"), t.keywords("BP08-086")]).toEqual([["BP08-086", "BP08-093", "BP08-099"], ["rush"], ["ward", "rush"]]);
    const act = d({ me: { field: ["BP08-086", "V1"], cemetery: ["BP08-093", "BP08-099", "BP08-091"] } }).activate("BP08-086");
    expect([act.stats("V1"), act.stats("BP08-086"), act.engaged("BP08-086"), act.cemetery(), act.canActivate("BP08-086")]).toEqual([
      [3, 3],
      [5, 6],
      false,
      [],
      false,
    ]);
    // Neutral V1 has no Rush from it.
    expect(act.keywords("V1")).toEqual([]);
  });

  it("087 / 088 Godsworn Alexiel — Fanfare: leader +2 per amulet on your field; evolved deals that much to an enemy follower and its leader", () => {
    const t = d({ me: { hand: ["BP08-087"], field: ["BP08-024", "BP08-102"], playPoints: 7 } }).play("BP08-087").none();
    expect(t.leader()).toBe(24);
    const evo = d({ me: { field: ["BP08-087", "BP08-024", "BP08-102"], evolveDeck: ["BP08-088"], playPoints: 1 }, opp: { field: ["V5"] } });
    evo.evolve("BP08-087");
    expect([evo.stats("opp:V5"), evo.leader("opp")]).toEqual([[5, 1], 16]);
  });

  it("089 Eidolon of Madness — with 3 amulets on your field its Evolve costs 0 this turn", () => {
    const amulets = ["BP08-024", "BP08-102", "BP01-T10"];
    const t = d({ me: { hand: ["BP08-089"], field: amulets, evolveDeck: ["BP08-090"], playPoints: 2 } }).play("BP08-089");
    expect([t.pp(), t.canEvolve("BP08-089")]).toEqual([0, true]);
    const two = d({ me: { hand: ["BP08-089"], field: amulets.slice(1), evolveDeck: ["BP08-090"], playPoints: 2 } }).play("BP08-089");
    expect(two.canEvolve("BP08-089")).toBe(false);
  });

  it("090 Eidolon of Madness (Evolved) — an evolved amulet: On Evolve banishes an enemy follower; Last Words: 3 to each enemy leader", () => {
    const t = d({ me: { field: ["BP08-089"], evolveDeck: ["BP08-090"], playPoints: 2 }, opp: { field: ["V5"] } }).evolve("BP08-089");
    const eidolon = t.id("BP08-089");
    // CR 5.16.1.2.1: it becomes the type printed on the evolved card, with no attack or defense.
    expect([t.game.reader().info(eidolon).type, t.stats("BP08-089"), t.attackTargets("BP08-089")]).toEqual(["amulet", [null, null], []]);
    expect([t.field("opp"), t.zone("opp", "banished")]).toEqual([[], ["V5"]]);
    // Destroyed: the base goes to the cemetery and the evolved card faceup to the evolve deck (ruling).
    const lw = d({ me: { hand: ["BP08-095"], deck: ["V1"], playPoints: 8 }, opp: { field: [{ card: "BP08-089", evolvedInto: "BP08-090" }] } });
    lw.play("BP08-095").pick("opp:BP08-089");
    const faceUp = lw.game.reader().faceUpEvolveDeck(1).map((id) => lw.game.state.cards[id]!.def);
    expect([lw.leader(), lw.cemetery("opp"), faceUp]).toEqual([17, ["BP08-089"], ["BP08-090"]]);
  });

  it("091 Sekhmet — act (engage, bury an amulet on your field): 4 damage to an enemy follower and 1 to its leader", () => {
    const t = d({ me: { field: ["BP08-091", "BP08-024"] }, opp: { field: ["V5"] } }).activate("BP08-091");
    expect([t.stats("opp:V5"), t.leader("opp"), t.cemetery(), t.engaged("BP08-091")]).toEqual([[5, 1], 19, ["BP08-024"], true]);
    expect(d({ me: { field: ["BP08-091"] }, opp: { field: ["V5"] } }).canActivate("BP08-091")).toBe(false);
  });

  it("092 Vengeful Radiance — Quick, not during your turn; 4 damage divided between up to 2 enemy followers", () => {
    expect(d({ me: { hand: ["BP08-092"], playPoints: 2 }, opp: { field: ["V3"] } }).canPlay("BP08-092")).toBe(false);
    const t = d({ turn: 6, me: { hand: ["BP08-092"], playPoints: 2 }, opp: { field: ["V3", "V1"], deck: ["V1"] } });
    t.game.act({ type: "mainPhase", action: { type: "endMainPhase" } });
    t.quick("BP08-092").pick("opp:V3", "opp:V1").choose("2");
    expect([t.field("opp"), t.stats("opp:V3")]).toEqual([["V3"], [3, 2]]);
  });

  it("093 / 094 Colette — evolved: the opponent buries a follower of their choice (Aura doesn't stop it)", () => {
    const t = d({ me: { field: ["BP08-093"], evolveDeck: ["BP08-094"], playPoints: 2 }, opp: { field: ["V1", "V5"] } });
    t.evolve("BP08-093").pick("opp:V1");
    expect([t.field("opp"), t.cemetery("opp")]).toEqual([["V5"], ["V1"]]);
    const aura = d({ me: { field: ["BP08-093"], evolveDeck: ["BP08-094"], playPoints: 2 }, opp: { field: ["BP08-037"] } }).evolve("BP08-093");
    expect(aura.cemetery("opp")).toEqual(["BP08-037"]);
  });

  it("095 Battlefield Inquisitor — Fanfare destroys up to 2 enemy cards and draws, even with none selected", () => {
    const t = d({ me: { hand: ["BP08-095"], deck: ["V1"], playPoints: 8 }, opp: { field: ["V1", "BP08-024", "V5"] } });
    t.play("BP08-095").pick("opp:V1", "opp:BP08-024");
    expect([t.field("opp"), t.hand()]).toEqual([["V5"], ["V1"]]);
    const none = d({ me: { hand: ["BP08-095"], deck: ["V1"], playPoints: 8 } }).play("BP08-095");
    expect(none.hand()).toEqual(["V1"]);
  });

  it("096 Manifestation of Repose — costs 2 less with Marwynn on your field; your follower +2 defense, draw; needs a follower", () => {
    const t = d({ me: { hand: ["BP08-096"], field: ["BP05-086"], deck: ["V1"], playPoints: 0 } }).play("BP08-096");
    expect([t.stats("BP05-086"), t.hand()]).toEqual([[4, 6], ["V1"]]);
    expect(d({ me: { hand: ["BP08-096"], field: ["V1"], playPoints: 1 } }).canPlay("BP08-096")).toBe(false);
    expect(d({ me: { hand: ["BP08-096"], playPoints: 2 } }).canPlay("BP08-096")).toBe(false);
  });

  it("097 Malevolent Al-mi'raj — Ward; buries the top card; Bane if it was a follower with Ward", () => {
    const ward = d({ me: { hand: ["BP08-097"], deck: ["BP08-001"], playPoints: 2 } }).play("BP08-097").none();
    expect([ward.cemetery(), ward.keywords("BP08-097")]).toEqual([["BP08-001"], ["ward", "bane"]]);
    const plain = d({ me: { hand: ["BP08-097"], deck: ["V1"], playPoints: 2 } }).play("BP08-097").none();
    expect(plain.keywords("BP08-097")).toEqual(["ward"]);
  });

  it("098 Zealot of Repose — at the start of each opponent's main phase, destroys an enemy follower with 4 defense or less", () => {
    const t = d({ me: { field: ["BP08-098"], deck: ["V1"] }, opp: { field: ["V3", "V5"], deck: ["V1"] } }).end();
    expect(t.field("opp")).toEqual(["V5"]);
  });

  it("099 / 100 Temple Windbear — evolved summons a Holy Tiger; draws with 2 amulets on your field", () => {
    const t = d({ me: { field: ["BP08-099", "BP08-024", "BP01-T10"], evolveDeck: ["BP08-100"], deck: ["V1"], playPoints: 2 } }).evolve("BP08-099");
    expect([t.field(), t.hand()]).toEqual([["BP08-099", "BP08-024", "BP01-T10", HOLY_TIGER], ["V1"]]);
    const one = d({ me: { field: ["BP08-099", "BP08-024"], evolveDeck: ["BP08-100"], deck: ["V1"], playPoints: 2 } }).evolve("BP08-099");
    expect(one.hand()).toEqual([]);
  });

  it("101 Angel of the Iron Steed — Ward; Fanfare summons a Mystic Artifact (whose Fanfare draws)", () => {
    // Both have Ward: each may enter engaged (CR 12.8.2).
    const t = d({ me: { hand: ["BP08-101"], deck: ["V1"], playPoints: 4 } }).play("BP08-101").none().none();
    expect([t.field(), t.hand(), t.keywords("BP08-101")]).toEqual([["BP08-101", "BP05-T05"], ["V1"], ["ward"]]);
  });

  it("102 Forgotten Sanctuary — Fanfare: a Holy Tiger; Last Words: leader +2 (also when buried)", () => {
    expect(d({ me: { hand: ["BP08-102"], playPoints: 3 } }).play("BP08-102").field()).toEqual(["BP08-102", HOLY_TIGER]);
    const lw = d({ me: { field: ["BP08-091", "BP08-102"] }, opp: { field: ["V5"] } }).activate("BP08-091");
    expect(lw.leader()).toBe(22);
  });
});
