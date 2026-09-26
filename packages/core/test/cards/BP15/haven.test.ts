import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP15 Havencraft (094–111, PR16). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); AMULET is a 1-cost
// amulet. BP05-086 is Marwynn, Omen of Repose; BP05-088 Deus Ex Machina; BP15-032 Penguin Guardian a Swordcraft
// Ward follower. Tokens: BP15-PR16 Torrent of Despair, BP05-T05 Mystic Artifact, BP01-T17 Holy Tiger.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const TORRENT = "BP15-PR16";
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP15 Havencraft", () => {
  it("094 / 095 Marwynn, Repose of Despair — Ward; Fanfare: a Torrent of Despair with 3 enemy followers; leader +2 at the start of each opponent's main phase; evolved: destroy each other follower", () => {
    expect(d({ me: { hand: ["BP15-094"], playPoints: 4 }, opp: { field: n(3) } }).play("BP15-094").none().ex()).toEqual([TORRENT]);
    expect(d({ me: { hand: ["BP15-094"], playPoints: 4 }, opp: { field: n(2) } }).play("BP15-094").none().ex()).toEqual([]);
    expect(d({ me: { field: [{ card: "BP15-094", engaged: true }] }, opp: { deck: ["V1"] } }).end().leader()).toBe(22);
    const evo = d({ me: { field: ["BP15-094", "V1"], evolveDeck: ["BP15-095"], playPoints: 3 }, opp: { field: ["V5", "V3"] } }).evolve("BP15-094");
    expect([evo.field(), evo.field("opp"), evo.keywords("BP15-094")]).toEqual([["BP15-094"], [], ["ward"]]);
  });

  it("096 Wilbert, Luminous Paladin — Ward; Fanfare: a Ward follower (2 or less) from the top 5 onto the field; act, engage: destroy with 3 Ward followers", () => {
    const t = d({ me: { hand: ["BP15-096"], deck: ["V1", "BP15-106", "V3", "V5", "V2"], playPoints: 4 } }).play("BP15-096").none().pick("BP15-106").none().order();
    expect(t.field()).toEqual(["BP15-096", "BP15-106"]);
    const act = d({ me: { field: ["BP15-096", "BP15-106", "BP15-109"] }, opp: { field: ["V5"] } }).activate("BP15-096");
    expect([act.field("opp"), act.engaged("BP15-096")]).toEqual([[], true]);
    expect(d({ me: { field: ["BP15-096", "BP15-106"] }, opp: { field: ["V5"] } }).canActivate("BP15-096")).toBe(false);
  });

  it("097 Sarissa, Luxflash Spear — Ward; Storm with 3 cards on your field; Fanfare: -1/-1", () => {
    const t = d({ me: { hand: ["BP15-097"], field: ["V1", "AMULET"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP15-097").none();
    expect([t.stats("opp:V5"), t.keywords("BP15-097")]).toEqual([[4, 4], ["ward", "storm"]]);
    expect(d({ me: { hand: ["BP15-097"], field: ["V1"], playPoints: 2 } }).play("BP15-097").none().keywords("BP15-097")).toEqual(["ward"]);
  });

  it("098 / 099 Shiro, Cursed Wings — Ward; Fanfare: a Ward follower (2 or less) from the cemetery; evolved: damage per other Ward follower of yours", () => {
    expect(d({ me: { hand: ["BP15-098"], cemetery: ["BP15-106"], playPoints: 4 } }).play("BP15-098").none().none().field()).toEqual(["BP15-098", "BP15-106"]);
    const evo = d({ me: { field: ["BP15-098", "BP15-106", "BP15-109", "V1"], evolveDeck: ["BP15-099"], playPoints: 1 }, opp: { field: ["V5", "V3"] } }).evolve("BP15-098");
    expect([evo.stats("opp:V5"), evo.stats("opp:V3")]).toEqual([[5, 3], [3, 2]]);
  });

  it("100 Cyclical Fate — a Deus Ex Machina from the deck, and an Ancient or Mystic Artifact", () => {
    const t = d({ me: { hand: ["BP15-100"], deck: ["V1", "BP05-088"], playPoints: 5 } }).play("BP15-100").pick("BP05-088").choose("Mystic Artifact").none();
    expect([t.field(), t.hand()]).toEqual([["BP05-088", "BP05-T05"], ["V1"]]);
  });

  it("101 Perpetual Despair — from the cemetery into the EX area when a Marwynn follower comes, leader +1; act, engage and bury it: draw", () => {
    const t = d({ me: { hand: ["BP15-094"], cemetery: ["BP15-101"], playPoints: 4 } }).play("BP15-094").none().pending("BP15-101").yes();
    expect([t.ex(), t.leader()]).toEqual([["BP15-101"], 21]);
    const act = d({ me: { field: ["BP15-101"], deck: ["V1"] } }).activate("BP15-101");
    expect([act.hand(), act.cemetery()]).toEqual([["V1"], ["BP15-101"]]);
  });

  it("102 / 103 Adherent of Despair — at the start of each opponent's main phase, a reserved one keeps an enemy follower from attacking; evolved: destroy with a Marwynn follower on your field or in your cemetery", () => {
    const t = d({ me: { field: ["BP15-102"] }, opp: { field: ["V5"], deck: ["V1"] } }).end();
    expect(t.attackTargets("opp:V5")).toEqual([]);
    const engaged = d({ me: { field: [{ card: "BP15-102", engaged: true }] }, opp: { field: ["V5"], deck: ["V1"] } }).end();
    expect(engaged.attackTargets("opp:V5")).not.toEqual([]);
    const evo = d({ me: { field: ["BP15-102"], evolveDeck: ["BP15-103"], cemetery: ["BP05-086"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP15-102");
    expect(evo.field("opp")).toEqual([]);
    expect(d({ me: { field: ["BP15-102"], evolveDeck: ["BP15-103"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP15-102").field("opp")).toEqual(["V5"]);
  });

  it("104 Zeno, Paradoxical Shield — Fanfare: a Ward follower from the top 3; act, engage and bury it: defense +1 with 3 Ward followers", () => {
    expect(d({ me: { hand: ["BP15-104"], deck: ["V1", "BP15-106", "V3"], playPoints: 1 } }).play("BP15-104").pick("BP15-106").order().hand()).toEqual(["BP15-106"]);
    const act = d({ me: { field: ["BP15-104", "BP15-106", "BP15-109", "BP15-032"] } }).activate("BP15-104").pick("BP15-106");
    expect([act.stats("BP15-106"), act.cemetery()]).toEqual([[1, 4], ["BP15-104"]]);
    expect(d({ me: { field: ["BP15-104", "BP15-106", "BP15-109"] } }).canActivate("BP15-104")).toBe(false);
  });

  it("105 Crusader's Rallying Cry — Fanfare: a Holy Tiger; act, engage and bury it: 2 damage with 3 amulets in the cemetery", () => {
    expect(d({ me: { hand: ["BP15-105"], playPoints: 3 } }).play("BP15-105").field()).toEqual(["BP15-105", "BP01-T17"]);
    expect(d({ me: { field: ["BP15-105"], cemetery: n(3, "AMULET") }, opp: { field: ["V5"] } }).activate("BP15-105").stats("opp:V5")).toEqual([5, 3]);
    expect(d({ me: { field: ["BP15-105"], cemetery: n(2, "AMULET") }, opp: { field: ["V5"] } }).canActivate("BP15-105")).toBe(false);
  });

  it("106 / 107 Temple Healer — Ward; Fanfare, discard a Ward follower: draw; evolved: draw", () => {
    const t = d({ me: { hand: ["BP15-106", "BP15-109"], deck: ["V1"], playPoints: 2 } }).play("BP15-106").none().yes();
    expect([t.hand(), t.cemetery()]).toEqual([["V1"], ["BP15-109"]]);
    expect(d({ me: { field: ["BP15-106"], evolveDeck: ["BP15-107"], deck: ["V1"], playPoints: 1 } }).evolve("BP15-106").hand()).toEqual(["V1"]);
  });

  it("108 Hermit of Repose — Fanfare (2): +2 attack; its attack in damage to each enemy follower at the start of each opponent's main phase", () => {
    expect(d({ me: { hand: ["BP15-108"], playPoints: 5 } }).play("BP15-108").yes().stats("BP15-108")).toEqual([3, 5]);
    expect(d({ me: { field: ["BP15-108"] }, opp: { field: ["V1", "V3"], deck: ["V1"] } }).end().stats("opp:V3")).toEqual([3, 3]);
  });

  it("109 Hardplume Warrior — Ward; Fanfare: Storm to another Havencraft Ward follower with 3 Ward followers", () => {
    const t = d({ me: { hand: ["BP15-109"], field: ["BP15-106", "BP15-032"], playPoints: 2 } }).play("BP15-109").none();
    expect(t.keywords("BP15-106")).toEqual(["ward", "storm"]);
    expect(d({ me: { hand: ["BP15-109"], field: ["BP15-106"], playPoints: 2 } }).play("BP15-109").none().keywords("BP15-106")).toEqual(["ward"]);
  });

  it("110 Caladrius — Rush; Fanfare, bury an amulet: Storm", () => {
    const t = d({ me: { hand: ["BP15-110"], field: ["AMULET"], playPoints: 6 } }).play("BP15-110").yes();
    expect([t.keywords("BP15-110"), t.cemetery()]).toEqual([["rush", "storm"], ["AMULET"]]);
  });

  it("111 Sacred Gavel — Fanfare: 3 damage; Last Words: leader +1", () => {
    expect(d({ me: { hand: ["BP15-111"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP15-111").stats("opp:V5")).toEqual([5, 2]);
    expect(d({ me: { hand: ["BP15-110"], field: ["BP15-111"], playPoints: 6 } }).play("BP15-110").yes().leader()).toBe(21);
  });

  it("PR16 Torrent of Despair — banish an enemy follower", () => {
    expect(d({ me: { ex: [TORRENT] }, opp: { field: ["V5"] } }).play(`${TORRENT}@ex`).zone("opp", "banished")).toEqual(["V5"]);
  });
});
