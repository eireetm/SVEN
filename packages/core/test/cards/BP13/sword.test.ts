import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP13 Swordcraft (019–035). V1 is 1c 2/2, V5 5c 5/5 (Neutral); QUICK-SAC destroys one of your followers;
// PING-UPTO2 deals 1 damage to up to 2 enemy followers. BP13-026 Lounes is a 1-cost Levin follower;
// BP02-027 Yurius, Levin Duke; BP02-018 Albert, Levin Saber; BP03-020 Valiant Fencer is a Heroic Commander.
// Tokens: BP01-T03 Fairy, BP01-T07 Steelclad Knight, BP02-T02 Shield Guardian (Ward).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const FAIRY = "BP01-T03";
const KNIGHT = "BP01-T07";
const GUARDIAN = "BP02-T02";
const n = (count: number, id = "V1") => Array<string>(count).fill(id);
const levin = (count: number) => n(count, "BP13-026");

describe("BP13 Swordcraft", () => {
  it("019 / 020 Albert, Thunderous Doom — Storm; bury another Levin follower: destroy; evolved: Strike destroys up to 1 and gains +X/+X per follower put into a cemetery this turn; (2): refresh with 10 Levin cards", () => {
    const t = d({ me: { hand: ["BP13-019"], field: ["BP13-026"], playPoints: 6 }, opp: { field: ["V5"] } }).play("BP13-019").yes();
    expect([t.field(), t.cemetery(), t.field("opp"), t.keywords("BP13-019")]).toEqual([["BP13-019"], ["BP13-026"], [], ["storm"]]);
    const albert = { card: "BP13-019", evolvedInto: "BP13-020" };
    const strike = d({ me: { field: [albert] }, opp: { field: ["V5", "V1"] } }).attack("BP13-019", "opp:leader").pick("opp:V5");
    expect([strike.field("opp"), strike.stats("BP13-019"), strike.leader("opp")]).toEqual([["V1"], [5, 7], 15]);
    expect(d({ me: { field: [albert] }, opp: { field: ["V5"] } }).attack("BP13-019", "opp:leader").none().leader("opp")).toBe(16);
    const act = d({ me: { field: [{ ...albert, engaged: true }], cemetery: levin(10), playPoints: 2 } }).activate("BP13-019");
    expect(act.engaged("BP13-019")).toBe(false);
    expect(d({ me: { field: [{ ...albert, engaged: true }], cemetery: levin(9), playPoints: 2 } }).canActivate("BP13-019")).toBe(false);
  });

  it("021 Magna Zero — banishes the top 10; 5 damage to each enemy, 10 with 20 banished cards", () => {
    const t = d({ me: { hand: ["BP13-021"], deck: n(10), playPoints: 7 }, opp: { field: ["V5"] } }).play("BP13-021");
    expect([t.zone("me", "banished").length, t.field("opp"), t.leader("opp")]).toEqual([10, [], 15]);
    expect(d({ me: { hand: ["BP13-021"], deck: n(10), banished: n(10), playPoints: 7 } }).play("BP13-021").leader("opp")).toBe(10);
    // Fewer than 10 cards: as many as there are, no loss (ruling).
    const few = d({ me: { hand: ["BP13-021"], deck: n(5), playPoints: 7 } }).play("BP13-021");
    expect([few.zone("me", "banished").length, few.leader("opp"), few.decision?.type]).toEqual([5, 15, "mainPhase"]);
  });

  it("022 / 023 Sera — your token followers don't take ability damage; an Officer follower entering during your turn gives leader +1; evolved: 3 Shield Guardians", () => {
    expect(d({ me: { hand: ["PING-UPTO2"] }, opp: { field: ["BP13-022", FAIRY] } }).play("PING-UPTO2").pick(`opp:${FAIRY}`).field("opp")).toEqual(["BP13-022", FAIRY]);
    expect(d({ me: { hand: ["PING-UPTO2"] }, opp: { field: [FAIRY] } }).play("PING-UPTO2").pick(`opp:${FAIRY}`).field("opp")).toEqual([]);
    expect(d({ me: { field: ["BP13-022"], hand: ["BP13-032"], playPoints: 1 } }).play("BP13-032").none().flush().leader()).toBe(21);
    const evo = d({ me: { field: ["BP13-022"], evolveDeck: ["BP13-023"], playPoints: 1 } }).evolve("BP13-022").none().flush();
    expect([evo.field(), evo.leader()]).toEqual([["BP13-022", GUARDIAN, GUARDIAN, GUARDIAN], 23]);
  });

  it("024 Homebound Infantryman — Assail, can't attack leaders; at your end phase with a Commander that costs 3 or more, (1): summoned from the cemetery", () => {
    expect(d({ me: { field: ["BP13-024"] }, opp: { field: ["V5"] } }).attackTargets("BP13-024")).toEqual(["V5"]);
    const t = d({ me: { cemetery: ["BP13-024"], field: ["BP13-022"], playPoints: 1 }, opp: { deck: ["V1"] } }).end().yes();
    expect(t.field()).toEqual(["BP13-022", "BP13-024"]);
    const none = d({ me: { cemetery: ["BP13-024"], field: ["V5"], playPoints: 1 }, opp: { deck: ["V1"] } }).end();
    expect(none.cemetery()).toEqual(["BP13-024"]);
  });

  it("025 Levin Justice — 3 damage and a Yurius from the deck; for 2 more, an Albert, Levin Saber too", () => {
    const t = d({ me: { hand: ["BP13-025"], deck: ["V1", "BP02-027", "BP02-018"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP13-025").pick("BP02-027");
    expect([t.stats("opp:V5"), t.field()]).toEqual([[5, 2], ["BP02-027"]]);
    const plus = d({ me: { hand: ["BP13-025"], deck: ["V1", "BP02-027", "BP02-018"], playPoints: 5 }, opp: { field: ["V5"] } });
    plus.play("BP13-025").choose("plus2").none().pick("BP02-018");
    expect([plus.field(), plus.pp()]).toEqual([["BP02-018"], 0]);
  });

  it("026 / 027 Lounes — discard a Levin card: an Albert follower from the deck; evolved: may summon an Albert that costs up to your max PP; an Albert entering during your turn, (1): 3 damage", () => {
    const t = d({ me: { hand: ["BP13-026", "BP13-032"], deck: ["V1", "BP13-019"], playPoints: 1 } }).play("BP13-026").yes().pick("BP13-019");
    expect([t.hand(), t.cemetery()]).toEqual([["BP13-019"], ["BP13-032"]]);
    const evo = d({ me: { field: ["BP13-026"], evolveDeck: ["BP13-027"], hand: ["BP13-019"], playPoints: 6, maxPlayPoints: 6 }, opp: { field: ["V5"] } });
    evo.evolve("BP13-026").pick("BP13-019").pending("BP13-027").yes().no();
    expect([evo.field(), evo.stats("opp:V5"), evo.pp()]).toEqual([["BP13-026", "BP13-019"], [5, 2], 2]);
    const low = d({ me: { field: ["BP13-026"], evolveDeck: ["BP13-027"], hand: ["BP13-019"], playPoints: 5, maxPlayPoints: 5 } }).evolve("BP13-026");
    expect(low.field()).toEqual(["BP13-026"]);
  });

  it("028 Jeno — bury a Levin follower that costs 3 or less: 3 less; Fanfare 4 damage", () => {
    const t = d({ me: { hand: ["BP13-028"], field: ["BP13-026"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP13-028");
    expect([t.field(), t.cemetery(), t.stats("opp:V5")]).toEqual([["BP13-028"], ["BP13-026"], [5, 1]]);
    expect(d({ me: { hand: ["BP13-028"], field: ["V1"], playPoints: 1 } }).canPlay("BP13-028")).toBe(false);
  });

  it("029 Cat Admiral — (3): a Steelclad Knight and a Shield Guardian; a Swordcraft token follower entering during your turn deals 1", () => {
    const t = d({ me: { hand: ["BP13-029"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP13-029").yes().none().flush();
    expect([t.field(), t.stats("opp:V5")]).toEqual([["BP13-029", KNIGHT, GUARDIAN], [5, 3]]);
  });

  it("030 / 031 Mina — 3 damage with 5 Levin cards in the cemetery; evolved: a Levin card from the top 4", () => {
    expect(d({ me: { hand: ["BP13-030"], cemetery: levin(5), playPoints: 2 }, opp: { field: ["V5"] } }).play("BP13-030").stats("opp:V5")).toEqual([5, 2]);
    expect(d({ me: { hand: ["BP13-030"], cemetery: levin(4), playPoints: 2 }, opp: { field: ["V5"] } }).play("BP13-030").stats("opp:V5")).toEqual([5, 5]);
    const evo = d({ me: { field: ["BP13-030"], evolveDeck: ["BP13-031"], deck: ["V1", "BP13-032", "V5", "V1"], playPoints: 1 } }).evolve("BP13-030").pick("BP13-032").order();
    expect(evo.hand()).toEqual(["BP13-032"]);
  });

  it("032 Mona — Ward; discard a Levin card: draw; end phase leader +1 with 5 Levin cards in the cemetery", () => {
    const t = d({ me: { hand: ["BP13-032", "BP13-026"], deck: ["V1"], playPoints: 1 } }).play("BP13-032").none().yes();
    expect([t.hand(), t.cemetery(), t.keywords("BP13-032")]).toEqual([["V1"], ["BP13-026"], ["ward"]]);
    expect(d({ me: { field: ["BP13-032"], cemetery: levin(5) }, opp: { deck: ["V1"] } }).end().leader()).toBe(21);
    expect(d({ me: { field: ["BP13-032"], cemetery: levin(4) }, opp: { deck: ["V1"] } }).end().leader()).toBe(20);
  });

  it("033 Mena — Rush; with 5 Levin cards in the cemetery, Assail and Strike +2/+1", () => {
    const t = d({ me: { field: ["BP13-033"], cemetery: levin(5) } });
    expect(t.keywords("BP13-033")).toEqual(["rush", "assail"]);
    expect([t.attack("BP13-033", "opp:leader").leader("opp"), t.stats("BP13-033")]).toEqual([15, [5, 3]]);
    const few = d({ me: { field: ["BP13-033"], cemetery: levin(4) } });
    expect(few.keywords("BP13-033")).toEqual(["rush"]);
    expect(few.attack("BP13-033", "opp:leader").leader("opp")).toBe(17);
  });

  it("034 Icyclone — 1 damage, 4 with another Heroic follower; Last Words: a Heroic top card may go into the EX area", () => {
    expect(d({ me: { hand: ["BP13-034"], field: ["BP03-020"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP13-034").stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { hand: ["BP13-034"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP13-034").stats("opp:V5")).toEqual([5, 4]);
    expect(d({ me: { field: ["BP13-034"], hand: ["QUICK-SAC"], deck: ["BP03-020", "V1"] } }).play("QUICK-SAC").pick("BP03-020").ex()).toEqual(["BP03-020"]);
    const plain = d({ me: { field: ["BP13-034"], hand: ["QUICK-SAC"], deck: ["V1", "BP03-020"] } }).play("QUICK-SAC");
    expect([plain.ex(), plain.zone("me", "deck")]).toEqual([[], ["V1", "BP03-020"]]);
  });

  it("035 Meet the Levin Sisters! — one of Mina, Mona and Mena to the hand; for 4 more, one of each onto the field", () => {
    expect(d({ me: { hand: ["BP13-035"], deck: ["V1", "BP13-032", "BP13-033"], playPoints: 1 } }).play("BP13-035").pick("BP13-033").hand()).toEqual(["BP13-033"]);
    const t = d({ me: { hand: ["BP13-035"], deck: ["BP13-030", "BP13-032", "BP13-033", "V1"], playPoints: 5 } });
    t.play("BP13-035").choose("plus4").pick("BP13-030").pick("BP13-032").pick("BP13-033").none().flush();
    expect([t.field(), t.pp()]).toEqual([["BP13-030", "BP13-032", "BP13-033"], 0]);
  });
});
