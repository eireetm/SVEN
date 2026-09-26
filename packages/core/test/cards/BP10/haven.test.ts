import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP10 Havencraft (092–108). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral). BP10-107 is a
// 1-cost Faith follower with Ward; BP10-095 a 2-cost Arcana follower; BP03-106 Bejeweled Shrine. Tokens:
// BP01-T16 Holy Falcon, BP01-T17 Holy Tiger. Ward followers put onto the field ask whether to enter
// engaged (answered with none()).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP10 Havencraft", () => {
  it("092 / 093 Sofina — followers on your field take at most 3 damage; evolved: summons a Somnolent Strength from the deck", () => {
    const t = d({ turn: 6, me: { field: ["BP10-092", { card: "V3", engaged: true }] }, opp: { field: ["V5"] } }).attack("opp:V5", "V3");
    expect([t.stats("V3"), t.stats("opp:V5")]).toEqual([[3, 1], [5, 2]]);
    const evo = d({ me: { field: ["BP10-092", "V1"], evolveDeck: ["BP10-093"], deck: ["V1", "BP10-098"], playPoints: 1 } });
    evo.evolve("BP10-092").pick("BP10-098").pick("V1");
    expect([evo.field(), evo.stats("V1")]).toEqual([["BP10-092", "V1", "BP10-098"], [3, 3]]);
  });

  it("094 X. Slaus — Fanfare (2): a Wheel of Misfortune into the EX area; whenever a card is put into your EX area, engage: destroy an enemy follower", () => {
    const t = d({ me: { hand: ["BP10-094"], deck: ["V1", "BP10-102"], playPoints: 4 }, opp: { field: ["V5"] } });
    t.play("BP10-094").yes().pick("BP10-102").yes();
    expect([t.ex(), t.field("opp"), t.engaged("BP10-094")]).toEqual([["BP10-102"], [], true]);
  });

  it("095 / 096 Reverend Adjudicator — evolved: a Ward follower from the top 4 into the EX area, costing 1 less this turn", () => {
    const t = d({ me: { field: ["BP10-095"], evolveDeck: ["BP10-096"], deck: ["V1", "BP10-107", "V3", "V5"], playPoints: 1 } });
    t.evolve("BP10-095").pick("BP10-107").order();
    expect([t.ex(), t.zone("me", "deck"), t.pp(), t.canPlay("BP10-107")]).toEqual([["BP10-107"], ["V1", "V3", "V5"], 0, true]);
  });

  it("097 Tanzanite Convictor — Storm; with a 7-defense follower 4 to each enemy follower; refreshes at your end phase with 3 attack", () => {
    const priestess = { card: "BP10-103", evolvedInto: "BP10-104" };
    const t = d({ me: { hand: ["BP10-097"], field: [priestess], playPoints: 3 }, opp: { field: ["V5", "V3"] } }).play("BP10-097");
    expect([t.field("opp"), t.stats("opp:V5"), t.keywords("BP10-097")]).toEqual([["V5"], [5, 1], ["storm"]]);
    const weak = d({ me: { hand: ["BP10-097"], field: ["BP10-103"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP10-097");
    expect(weak.stats("opp:V5")).toEqual([5, 5]);
    const end = d({ me: { field: [{ card: "BP10-097", engaged: true }], hand: ["BP10-098"], playPoints: 2 }, opp: { deck: ["V1"] } });
    end.play("BP10-098").pick("BP10-097").end();
    expect(end.engaged("BP10-097")).toBe(false);
    const stays = d({ me: { field: [{ card: "BP10-097", engaged: true }] }, opp: { deck: ["V1"] } }).end();
    expect(stays.engaged("BP10-097")).toBe(true);
  });

  it("098 Somnolent Strength — up to 2 followers +1/+1; (1, engage, bury): an enemy follower attack -2", () => {
    const t = d({ me: { hand: ["BP10-098"], field: ["V1", "V3"], playPoints: 3 }, opp: { field: ["V1"] } }).play("BP10-098").pick("V1", "V3");
    expect([t.stats("V1"), t.stats("V3")]).toEqual([[3, 3], [4, 5]]);
    t.activate("BP10-098");
    expect([t.stats("opp:V1"), t.cemetery()]).toEqual([[0, 2], ["BP10-098"]]);
  });

  it("099 / 100 Topaz Swordian — Ward; summons a Bejeweled Shrine; Fanfare (2): +1/+3; evolved: destroys an enemy follower with 3 defense or less", () => {
    const t = d({ me: { hand: ["BP10-099"], deck: ["V1", "BP03-106"], playPoints: 5 } }).play("BP10-099").none().pending().pick("BP03-106").yes();
    expect([t.field(), t.stats("BP10-099"), t.keywords("BP10-099")]).toEqual([["BP10-099", "BP03-106"], [3, 6], ["ward"]]);
    const evo = d({ me: { field: ["BP10-099"], evolveDeck: ["BP10-100"], playPoints: 1 }, opp: { field: ["V5", "V1"] } }).evolve("BP10-099");
    expect(evo.field("opp")).toEqual(["V5"]);
  });

  it("101 Puresong Priest — a follower of yours and your leader +4 defense; Quick from the hand (1, discard it): leader +2", () => {
    const t = d({ me: { hand: ["BP10-101"], field: ["V1"], playPoints: 7 } }).play("BP10-101").pick("V1");
    expect([t.stats("V1"), t.leader()]).toEqual([[2, 6], 24]);
    const quick = d({ turn: 6, me: { hand: ["BP10-101"], field: [{ card: "V3", engaged: true }], playPoints: 1 }, opp: { field: ["V5"] } });
    quick.attack("opp:V5", "V3").quick("BP10-101");
    expect([quick.leader(), quick.cemetery()]).toEqual([22, ["BP10-101", "V3"]]);
  });

  it("102 Wheel of Misfortune — with X. Slaus up to 2 calamity counters; engage: +1; engage, bury: destroy each enemy follower that costs X", () => {
    const t = d({ me: { hand: ["BP10-102"], field: ["BP10-094"], playPoints: 2 }, opp: { field: ["V2", "V1", { card: "BP10-095", evolvedInto: "BP10-096" }] } });
    t.play("BP10-102").choose("2");
    expect(t.counters("BP10-102", "calamity")).toBe(2);
    t.activate("BP10-102", 1);
    // An evolved follower's cost is its base card's (ruling).
    expect([t.field("opp"), t.cemetery()]).toEqual([["V1"], ["BP10-102"]]);
    const alone = d({ me: { hand: ["BP10-102"], playPoints: 2 } }).play("BP10-102");
    expect(alone.counters("BP10-102", "calamity")).toBe(0);
    alone.activate("BP10-102", 0);
    expect([alone.counters("BP10-102", "calamity"), alone.canActivate("BP10-102")]).toEqual([1, false]);
  });

  it("103 / 104 Priestess of Foresight — summons an Arcana follower that costs 4 or less from the deck; evolved: destroys up to 2 enemy followers", () => {
    const t = d({ me: { hand: ["BP10-103"], deck: ["V1", "BP10-095", "BP10-037"], playPoints: 7 } }).play("BP10-103").none().pick("BP10-095");
    expect(t.field()).toEqual(["BP10-103", "BP10-095"]);
    const evo = d({ me: { field: ["BP10-103"], evolveDeck: ["BP10-104"], playPoints: 1 }, opp: { field: ["V5", "V3", "V1"] } }).evolve("BP10-103").pick("opp:V5", "opp:V3");
    expect(evo.field("opp")).toEqual(["V1"]);
  });

  it("105 Azurite Maiden — Fanfare (1): a Faith follower from the cemetery into the EX area with +1 attack, kept when played from there", () => {
    const t = d({ me: { hand: ["BP10-105"], cemetery: ["BP10-107", "V1"], playPoints: 4 } }).play("BP10-105").none().yes();
    expect([t.ex(), t.stats("BP10-107")]).toEqual([["BP10-107"], [3, 2]]);
    t.play("BP10-107").none();
    expect([t.field(), t.stats("BP10-107")]).toEqual([["BP10-105", "BP10-107"], [3, 2]]);
  });

  it("106 Prismaplume Bird — a Holy Falcon, or an amulet from the cemetery to the hand", () => {
    expect(d({ me: { hand: ["BP10-106"], playPoints: 4 } }).play("BP10-106").field()).toEqual(["BP10-106", "BP01-T16"]);
    const amulet = d({ me: { hand: ["BP10-106"], cemetery: ["BP10-098"], playPoints: 4 } }).play("BP10-106").choose("amulet");
    expect(amulet.hand()).toEqual(["BP10-098"]);
  });

  it("107 Stalwart Featherfolk — Ward; Fanfare (2): +1/+1 and Storm", () => {
    const t = d({ me: { hand: ["BP10-107"], playPoints: 3 } }).play("BP10-107").none().yes();
    expect([t.stats("BP10-107"), t.keywords("BP10-107")]).toEqual([[3, 3], ["ward", "storm"]]);
    expect(t.attack("BP10-107", "opp:leader").leader("opp")).toBe(17);
  });

  it("108 Holybright Altar — a Holy Tiger destroyed at your end phase; (3, engage, bury): leader + a follower's cost", () => {
    const t = d({ me: { hand: ["BP10-108"], playPoints: 2 }, opp: { deck: ["V1"] } }).play("BP10-108");
    expect(t.field()).toEqual(["BP10-108", "BP01-T17"]);
    expect(t.end().field()).toEqual(["BP10-108"]);
    const act = d({ me: { field: ["BP10-108", { card: "BP10-103", evolvedInto: "BP10-104" }], playPoints: 3 } }).activate("BP10-108");
    expect([act.leader(), act.cemetery()]).toEqual([27, ["BP10-108"]]);
  });
});
