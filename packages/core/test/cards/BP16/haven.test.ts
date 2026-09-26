import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP16 Havencraft (093–110). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); AMULET is a 1-cost amulet; EVOLVER
// evolves into EVOLVER-E. BP02-091 is Enstatued Seraph; BP09-086 Jeanne (evolved: may summon a Havencraft follower that
// costs 2 or less from the hand). Wasteland cards: BP11-006 (6), BP11-008 (3), BP11-014 (1). Tokens: BP11-T04 Bullet
// Bike, BP01-T17 Holy Tiger.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("BP16 Havencraft", () => {
  it("093 Lapis, Shining Seraph — a follower while it has 4 prayer counters; at the start of your main phase, a prayer counter on any other cards and this; Strike: an Enstatued Seraph from the deck", () => {
    const type = (t: ReturnType<typeof d>) => t.game.reader().info(t.id("BP16-093")).type;
    const three = d({ me: { field: [{ card: "BP16-093", counters: { prayer: 3 } }, "AMULET"], deck: ["V1"] }, opp: { deck: ["V1"] } });
    expect([type(three), three.stats("BP16-093")]).toEqual(["amulet", [null, null]]);
    three.end().end().pick("AMULET");
    expect([type(three), three.stats("BP16-093"), three.counters("AMULET", "prayer"), three.attackTargets("BP16-093")]).toEqual(["follower", [5, 5], 1, ["opp:leader"]]);
    const strike = d({ me: { field: [{ card: "BP16-093", counters: { prayer: 4 } }], deck: ["V1", "BP02-091"] } }).attack("BP16-093", "opp:leader").pick("BP02-091");
    expect([strike.field(), strike.leader("opp")]).toEqual([["BP16-093", "BP02-091"], 15]);
  });

  it("094 / 095 Rodeo, Anathema of Judgment — end phase with 2 amulets: leader +2; evolved: an amulet (3 or less) from the deck; super-evolved: one (5 or less)", () => {
    expect(d({ me: { field: ["BP16-094", "AMULET", "AMULET"] }, opp: { deck: ["V1"] } }).end().leader()).toBe(22);
    expect(d({ me: { field: ["BP16-094"], evolveDeck: ["BP16-095"], deck: ["V1", "AMULET"], playPoints: 1 } }).evolve("BP16-094").pick("AMULET").field()).toEqual(["BP16-094", "AMULET"]);
    const s = d({ me: { field: ["BP16-094"], evolveDeck: ["BP16-095"], deck: ["V1", "BP16-110"], playPoints: 1, ...SUPER } }).evolve("BP16-094", { sep: true }).pending().pick("BP16-110");
    expect(s.field()).toEqual(["BP16-094", "BP16-110"]);
  });

  it("096 Rana, Dual Cannon Abbess — Fanfare: up to 2 Wasteland cards (total 6 or less) into the EX area costing 0 this turn, a Bullet Bike; act (0) once per turn: 1 damage to each enemy follower", () => {
    const t = d({ me: { hand: ["BP16-096"], deck: ["BP11-008", "BP11-014", "BP11-006", "V1"], playPoints: 6 } }).play("BP16-096").pick("BP11-008").pick("BP11-014");
    expect([t.ex(), t.field(), t.canPlay("BP11-008@ex"), t.canPlay("BP11-014@ex")]).toEqual([["BP11-008", "BP11-014"], ["BP16-096", "BP11-T04"], true, true]);
    const act = d({ me: { field: ["BP16-096"] }, opp: { field: ["V1", "V3"] } }).activate("BP16-096");
    expect([act.stats("opp:V1"), act.stats("opp:V3"), act.canActivate("BP16-096")]).toEqual([[2, 1], [3, 3], false]);
  });

  it("097 / 098 Ronavero, Darkhaven Ward — evolved: an enemy follower becomes 0/1 and engaged; super-evolved: a Faith spell or amulet (4 or less) from the cemetery into the EX area, 4 less this turn", () => {
    const t = d({ me: { field: ["BP16-097"], evolveDeck: ["BP16-098"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP16-097");
    expect([t.stats("opp:V5"), t.engaged("opp:V5")]).toEqual([[0, 1], true]);
    const s = d({ me: { field: ["BP16-097"], evolveDeck: ["BP16-098"], cemetery: ["BP16-110"], playPoints: 1, ...SUPER } }).evolve("BP16-097", { sep: true }).flush();
    expect([s.ex(), s.canPlay("BP16-110@ex")]).toEqual([["BP16-110"], true]);
  });

  it("099 Salefa, Guardian of Water — Fanfare / act once per turn, engage an amulet: an enemy follower can't attack during its controller's next turn", () => {
    const t = d({ me: { hand: ["BP16-099"], field: ["AMULET"], playPoints: 2 }, opp: { field: ["V5"], deck: ["V1"] } }).play("BP16-099").yes();
    expect(t.engaged("AMULET")).toBe(true);
    t.end();
    expect(t.attackTargets("opp:V5")).toEqual([]);
    const act = d({ me: { field: ["BP16-099", "AMULET"] }, opp: { field: ["V5"] } }).activate("BP16-099");
    expect([act.engaged("AMULET"), act.canActivate("BP16-099")]).toEqual([true, false]);
  });

  it("100 Pact of the Beast Princess — a Holy Tiger onto your field: engage an enemy follower; act (2), engage it and bury another amulet: a Holy Tiger", () => {
    const t = d({ me: { field: ["BP16-100", "AMULET"], playPoints: 2 }, opp: { field: ["V5"] } }).activate("BP16-100");
    expect([t.field(), t.engaged("opp:V5"), t.engaged("BP16-100")]).toEqual([["BP16-100", "BP01-T17"], true, true]);
  });

  it("101 / 102 Angelic Prism Priestess — Fanfare: an amulet from the top 3; evolved: may summon an amulet (2 or less) from the hand", () => {
    expect(d({ me: { hand: ["BP16-101"], deck: ["V1", "AMULET", "V3"], playPoints: 2 } }).play("BP16-101").pick("AMULET").order().hand()).toEqual(["AMULET"]);
    const evo = d({ me: { field: ["BP16-101"], evolveDeck: ["BP16-102"], hand: ["AMULET", "BP16-110"], playPoints: 1 } }).evolve("BP16-101").pick("AMULET");
    expect([evo.field(), evo.hand()]).toEqual([["BP16-101", "AMULET"], ["BP16-110"]]);
  });

  it("103 Reno, Luxwing Featherfolk — Rush; Strike: 1 to the enemy leader; Fanfare: put onto the field by an ability, Assail and no damage this turn", () => {
    const t = d({ me: { field: ["BP09-086"], evolveDeck: ["BP09-087"], hand: ["BP16-103"], playPoints: 1 }, opp: { field: [{ card: "V5", engaged: true }] } }).evolve("BP09-086").pick("BP16-103");
    expect(t.keywords("BP16-103")).toEqual(["rush", "assail"]);
    t.attack("BP16-103", "opp:V5");
    expect([t.stats("BP16-103"), t.field("opp"), t.leader("opp")]).toEqual([[3, 2], ["V5"], 19]);
    expect(d({ me: { hand: ["BP16-103"], playPoints: 2 } }).play("BP16-103").keywords("BP16-103")).toEqual(["rush"]);
  });

  it("104 Serene Sanctuary — Fanfare: a Luminary amulet from the deck; act, engage, with a prayer counter: bury it; Last Words: leader +1", () => {
    expect(d({ me: { hand: ["BP16-104"], deck: ["V1", "BP16-110"], playPoints: 1 } }).play("BP16-104").pick("BP16-110").hand()).toEqual(["BP16-110"]);
    const act = d({ me: { field: [{ card: "BP16-104", counters: { prayer: 1 } }] } }).activate("BP16-104");
    expect([act.cemetery(), act.leader()]).toEqual([["BP16-104"], 21]);
    expect(d({ me: { field: ["BP16-104"] } }).canActivate("BP16-104")).toBe(false);
  });

  it("105 / 106 Ironfist Priest — Ward; evolved: 4 to the enemy leader", () => {
    const t = d({ me: { field: ["BP16-105"], evolveDeck: ["BP16-106"], playPoints: 1 } }).evolve("BP16-105");
    expect([t.leader("opp"), t.keywords("BP16-105")]).toEqual([16, ["ward"]]);
  });

  it("107 Maeve, Guardian of Earth — Ward; Fanfare, bury an amulet: +1/+1, leader +3", () => {
    const t = d({ me: { hand: ["BP16-107"], field: ["AMULET"], playPoints: 3 } }).play("BP16-107").none().yes();
    expect([t.stats("BP16-107"), t.leader(), t.cemetery()]).toEqual([[4, 5], 23, ["AMULET"]]);
  });

  it("108 Holy Shieldmaiden — Ward; takes no damage during your turn", () => {
    const t = d({ me: { field: ["BP16-108"] }, opp: { field: [{ card: "V5", engaged: true }] } }).attack("BP16-108", "opp:V5");
    expect([t.stats("BP16-108"), t.stats("opp:V5"), t.keywords("BP16-108")]).toEqual([[4, 6], [5, 1], ["ward"]]);
  });

  it("109 Mainyu, Darkdweller — Aura; +1 attack when an amulet is put onto your field", () => {
    const t = d({ me: { field: ["BP16-109"], hand: ["AMULET"], playPoints: 1 } }).play("AMULET");
    expect([t.stats("BP16-109"), t.keywords("BP16-109")]).toEqual([[3, 2], ["aura"]]);
  });

  it("110 Darkhaven Grace — Fanfare: destroy an enemy follower; act, engage and bury it, after an evolution this turn: 2 to the enemy leader, draw", () => {
    expect(d({ me: { hand: ["BP16-110"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP16-110").field("opp")).toEqual([]);
    expect(d({ me: { field: ["BP16-110"] } }).canActivate("BP16-110")).toBe(false);
    const t = d({ me: { field: ["BP16-110", "EVOLVER"], evolveDeck: ["EVOLVER-E"], deck: ["V1"], playPoints: 2 } }).evolve("EVOLVER").activate("BP16-110");
    expect([t.leader("opp"), t.hand(), t.cemetery()]).toEqual([18, ["V1"], ["BP16-110"]]);
  });
});
