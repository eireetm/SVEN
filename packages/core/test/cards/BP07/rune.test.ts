import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP07 Runecraft (035–051). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5; KILL a 1-cost spell; AMULET a 1-cost
// amulet; QUICK-SAC destroys a follower of yours (0). Tokens: BP07-T01 Assembly Droid, BP07-T02
// Repair Mode (Machina), BP01-T10 Magic Sediment (Stack).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const DROID = "BP07-T01";
const REPAIR = "BP07-T02";
const SEDIMENT = "BP01-T10";

describe("BP07 Runecraft", () => {
  it("035 / 036 Tetra — a Repair Mode into the EX area; evolved: Machina cards from the EX area cost 1 less; 1 damage 4 times per turn", () => {
    expect(d({ me: { hand: ["BP07-035"] } }).play("BP07-035").ex()).toEqual([REPAIR]);
    const t = d({
      me: { field: [{ card: "BP07-035", evolvedInto: "BP07-036" }], ex: [REPAIR, REPAIR, REPAIR, REPAIR, REPAIR], playPoints: 0 },
      opp: { field: ["V5"] },
    });
    for (let i = 0; i < 5; i++) t.play(REPAIR);
    expect([t.stats("opp:V5"), t.leader(), t.ex()]).toEqual([[5, 1], 25, []]);
  });

  it("037 Belphomet — Rush; summons Machina followers from the top 5 costing 6 in total; end phase: other Machina followers +1/+1", () => {
    const t = d({ me: { hand: ["BP07-037"], deck: ["BP07-081", "BP07-080", "V1", "BP07-110", "BP07-081"], playPoints: 7 } });
    t.play("BP07-037").pick("BP07-080").pick("BP07-081").order();
    expect([t.field(), t.keywords("BP07-037"), t.zone("me", "deck")]).toEqual([["BP07-037", "BP07-080", "BP07-081"], ["rush"], ["V1", "BP07-110", "BP07-081"]]);
    const end = d({ me: { field: ["BP07-037", "BP07-081", "V1"] }, opp: { deck: ["V1"] } }).end();
    expect([end.stats("BP07-037"), end.stats("BP07-081"), end.stats("V1")]).toEqual([[5, 5], [3, 3], [2, 2]]);
  });

  it("038 Riley — Fanfare Earth Rite: choose one (up to 3 from the cemetery); act 6 from the cemetery: Storm and 'Last Words: banish this'", () => {
    const t = d({ me: { hand: ["BP07-038"], field: [SEDIMENT] }, opp: { field: ["V5"] } }).play("BP07-038").choose("damage").yes();
    expect([t.field("opp"), t.field()]).toEqual([[], ["BP07-038"]]);
    expect(d({ me: { hand: ["BP07-038"] }, opp: { field: ["V5"] } }).play("BP07-038").decision?.type).toBe("mainPhase");
    const back = d({ me: { cemetery: ["BP07-038"], field: [SEDIMENT], hand: ["QUICK-SAC"], deck: ["V1", "V1"], playPoints: 6 }, opp: { field: ["V5"] } });
    back.activate("BP07-038").choose("damage", "attack", "draw").yes();
    expect([back.field("opp"), back.stats("BP07-038"), back.hand(), back.keywords("BP07-038")]).toEqual([[], [6, 4], ["QUICK-SAC", "V1", "V1"], ["storm"]]);
    back.play("QUICK-SAC");
    expect([back.cemetery(), back.zone("me", "banished")]).toEqual([["QUICK-SAC"], ["BP07-038"]]);
  });

  it("039 / 040 Eleanor — discard a spell: draw; evolved: a Splendid Conjury into the EX area, 2 less this turn with Spellchain (10)", () => {
    const t = d({ me: { hand: ["BP07-039", "KILL"], deck: ["V1"] } }).play("BP07-039").yes();
    expect([t.hand(), t.cemetery()]).toEqual([["V1"], ["KILL"]]);
    const spells = Array<string>(10).fill("KILL");
    const evo = d({ me: { field: ["BP07-039"], evolveDeck: ["BP07-040"], deck: ["V1", "BP07-045"], cemetery: spells, playPoints: 1 } });
    evo.evolve("BP07-039").pick("BP07-045");
    expect([evo.ex(), evo.pp(), evo.canPlay("BP07-045")]).toEqual([["BP07-045"], 0, true]);
    const short = d({ me: { field: ["BP07-039"], evolveDeck: ["BP07-040"], deck: ["BP07-045"], cemetery: spells.slice(1), playPoints: 1 } });
    expect(short.evolve("BP07-039").pick("BP07-045").canPlay("BP07-045")).toBe(false);
  });

  it("041 Delta Cannon — Quick 2 damage; from the cemetery, pay 1 when a Tetra enters: into the EX area", () => {
    expect(d({ me: { hand: ["BP07-041"] }, opp: { field: ["V5"] } }).play("BP07-041").stats("opp:V5")).toEqual([5, 3]);
    const t = d({ me: { hand: ["BP07-035"], cemetery: ["BP07-041"], playPoints: 4 } }).play("BP07-035").pending("BP07-041").yes();
    expect([t.ex(), t.pp()]).toEqual([["BP07-041", REPAIR], 0]);
  });

  it("042 / 043 Displacer Bot — Ward; a Machina card from the top 4 into the EX area; evolved: 2 times your EX Machina cards", () => {
    const t = d({ me: { hand: ["BP07-042"], deck: ["V1", "BP07-081", "V3", "V5"] } }).play("BP07-042").none().pick("BP07-081").order();
    expect([t.ex(), t.zone("me", "deck")]).toEqual([["BP07-081"], ["V1", "V3", "V5"]]);
    const evo = d({ me: { field: ["BP07-042"], evolveDeck: ["BP07-043"], ex: [REPAIR, "BP07-081", "V1"], playPoints: 2 }, opp: { field: ["V5"] } });
    expect(evo.evolve("BP07-042").stats("opp:V5")).toEqual([5, 1]);
  });

  it("044 Mechanized Lifeform — a Repair Mode into the EX area; once per turn a Machina card played draws", () => {
    const t = d({ me: { hand: ["BP07-044"], deck: ["V1", "V1"], playPoints: 4 } }).play("BP07-044");
    t.play(REPAIR);
    expect([t.hand(), t.leader()]).toEqual([["V1"], 21]);
  });

  it("045 Splendid Conjury — up to 3 enemy followers share 3 damage, 5 with Eleanor", () => {
    const t = d({ me: { hand: ["BP07-045"] }, opp: { field: ["V1", "V3"] } }).play("BP07-045").pick("opp:V1", "opp:V3").choose("2");
    expect([t.field("opp"), t.stats("opp:V3")]).toEqual([["V3"], [3, 3]]);
    const five = d({ me: { hand: ["BP07-045"], field: ["BP07-039"] }, opp: { field: ["V5"] } }).play("BP07-045").pick("opp:V5");
    expect(five.field("opp")).toEqual([]);
  });

  it("046 Mechastaff Sorcerer — an Assembly Droid or Repair Mode into the EX area; engage and banish an EX Machina card: damage equal to those left", () => {
    expect(d({ me: { hand: ["BP07-046"] } }).play("BP07-046").choose("droid").ex()).toEqual([DROID]);
    const t = d({ me: { field: ["BP07-046"], ex: [REPAIR, REPAIR, REPAIR] }, opp: { field: ["V5"] } }).activate("BP07-046").pick(REPAIR);
    expect(t.stats("opp:V5")).toEqual([5, 3]);
  });

  it("047 Prototype Warrior — an Assembly Droid into the EX area, or +1/+1 and Rush with 3 Machina cards in your EX area", () => {
    expect(d({ me: { hand: ["BP07-047"] } }).play("BP07-047").choose("droid").ex()).toEqual([DROID]);
    const t = d({ me: { hand: ["BP07-047"], ex: [REPAIR, REPAIR, DROID] } }).play("BP07-047").choose("rush");
    expect([t.stats("BP07-047"), t.keywords("BP07-047")]).toEqual([[3, 2], ["rush"]]);
    expect(d({ me: { hand: ["BP07-047"], ex: [REPAIR, REPAIR] } }).play("BP07-047").choose("rush").stats("BP07-047")).toEqual([2, 1]);
  });

  it("048 / 049 Magiblade Witch — evolved: a Magic Sediment, or Earth Rite: 4 damage divided between up to 2", () => {
    const sediment = d({ me: { field: ["BP07-048"], evolveDeck: ["BP07-049"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP07-048").choose("sediment");
    expect(sediment.field()).toEqual(["BP07-048", SEDIMENT]);
    // (2) can be chosen without a Stack on the field and does nothing (BP10-050 ruling, CR 13.3.3.2).
    const noStack = d({ me: { field: ["BP07-048"], evolveDeck: ["BP07-049"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP07-048").choose("damage").pick("opp:V5");
    expect(noStack.stats("opp:V5")).toEqual([5, 5]);
    const rite = d({ me: { field: ["BP07-048", SEDIMENT], evolveDeck: ["BP07-049"], playPoints: 1 }, opp: { field: ["V5", "V1"] } });
    rite.evolve("BP07-048").choose("damage").yes().pick("opp:V5", "opp:V1").choose("2");
    expect([rite.field("opp"), rite.stats("opp:V5"), rite.field()]).toEqual([["V5"], [5, 3], ["BP07-048"]]);
  });

  it("050 Presto Chango — an enemy card to the bottom of its owner's deck; its controller may summon a follower or amulet from their hand", () => {
    const t = d({ me: { hand: ["BP07-050"] }, opp: { field: ["V5", "V1"], hand: ["V3", "KILL"] } }).play("BP07-050").pick("opp:V5").pick("opp:V3");
    expect([t.field("opp"), t.zone("opp", "deck"), t.hand("opp")]).toEqual([["V1", "V3"], ["V5"], ["KILL"]]);
  });

  it("051 Sagacious Core — a Machina card from the top 2; engage and bury it with 3 Machina cards in your EX area: 1 to the enemy leader", () => {
    const t = d({ me: { hand: ["BP07-051"], deck: ["BP07-081", "V1"] } }).play("BP07-051").pick("BP07-081");
    expect([t.hand(), t.zone("me", "deck")]).toEqual([["BP07-081"], ["V1"]]);
    expect(d({ me: { field: ["BP07-051"], ex: [REPAIR, REPAIR] } }).canActivate("BP07-051")).toBe(false);
    const act = d({ me: { field: ["BP07-051"], ex: [REPAIR, REPAIR, DROID] } }).activate("BP07-051");
    expect([act.leader("opp"), act.cemetery()]).toEqual([19, ["BP07-051"]]);
  });
});
