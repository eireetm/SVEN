import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP18 Swordcraft (020–038, T02). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); SWORD1 (1) is a Swordcraft follower.
// BP18-027 Gigabyte Blade (a Togh Keyoh amulet); Togh Keyoh followers: BP18-005 (2), BP18-032 (1), BP18-020 (3); BP18-011 is
// a Forestcraft follower with Evolve. Luminous cards: BP16-027 Commander, BP16-029 Magus, BP16-033 Lancetrooper.
// Tokens: BP01-T05 Knight, BP18-T02 All-Access Search.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const BLADE = "BP18-027";
const KNIGHT = "BP01-T05";
const SEARCH = "BP18-T02";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const giga = (count: number) => ({ card: BLADE, counters: { gigabyte: count } });
const n = (count: number, id: string) => Array<string>(count).fill(id);

describe("BP18 Swordcraft", () => {
  it("020 / 021 Shinra, All Discerning — Fanfare: a Gigabyte Blade; evolved: 3 damage (4 with 3 Togh Keyoh cards); super-evolved: an All-Access Search; act: 10 counters, 8 to the enemy leader", () => {
    const t = d({ me: { hand: ["BP18-020"], deck: ["V1", BLADE], playPoints: 3 } }).play("BP18-020").pick(BLADE).flush();
    expect([t.field(), t.counters(BLADE, "gigabyte")]).toEqual([["BP18-020", BLADE], 2]);
    const e = d({ me: { field: ["BP18-020", BLADE, "BP18-005"], evolveDeck: ["BP18-021"], playPoints: 1, ...SUPER }, opp: { field: ["V5"] } });
    e.evolve("BP18-020", { sep: true }).flush();
    expect([e.stats("opp:V5"), e.ex(), e.counters(BLADE, "gigabyte")]).toEqual([[5, 1], [SEARCH], 1]);
    const act = d({ me: { field: [{ card: "BP18-020", evolvedInto: "BP18-021" }, giga(10)] } }).activate("BP18-020");
    expect([act.leader("opp"), act.counters(BLADE, "gigabyte")]).toEqual([12, 0]);
    expect(d({ me: { field: [{ card: "BP18-020", evolvedInto: "BP18-021" }, giga(9)] } }).canActivate("BP18-020")).toBe(false);
  });

  it("022 Gamma, Canine Mediator — Fanfare: draw; act, 10 gigabyte counters: 5 to each enemy follower, +2/+2 and Storm", () => {
    expect(d({ me: { hand: ["BP18-022"], deck: ["V1"], playPoints: 3 } }).play("BP18-022").hand()).toEqual(["V1"]);
    const t = d({ me: { field: ["BP18-022", giga(10)] }, opp: { field: ["V5", "V3"] } }).activate("BP18-022");
    expect([t.field("opp"), t.stats("BP18-022"), t.keywords("BP18-022")]).toEqual([[], [5, 5], ["storm"]]);
  });

  it("023 Gawain, Oath to Glory — Rush; Fanfare: 5 / 10 / 15 / 20 Swordcraft followers in the cemetery", () => {
    const t = d({ me: { hand: ["BP18-023"], cemetery: n(20, "SWORD1"), deck: ["V1"], playPoints: 2 } }).play("BP18-023");
    expect([t.hand(), t.leader(), t.stats("BP18-023"), t.keywords("BP18-023")]).toEqual([["V1"], 22, [10, 10], ["rush", "storm", "intimidate", "aura"]]);
    const few = d({ me: { hand: ["BP18-023"], cemetery: n(9, "SWORD1"), deck: ["V1"], playPoints: 2 } }).play("BP18-023");
    expect([few.hand(), few.leader(), few.keywords("BP18-023")]).toEqual([["V1"], 20, ["rush"]]);
  });

  it("024 / 025 Bird's-Eye Investigator — Ward; evolved: up to 2 Togh Keyoh followers costing a total of 3 or less onto the field", () => {
    const t = d({ me: { field: ["BP18-024"], evolveDeck: ["BP18-025"], deck: ["BP18-032", "BP18-005", "BP18-020"], playPoints: 1 } });
    t.evolve("BP18-024").pick("BP18-032").pick("BP18-005").flush();
    expect([t.field(), t.leader(), t.keywords("BP18-024")]).toEqual([["BP18-024", "BP18-032", "BP18-005"], 22, ["ward"]]);
  });

  it("026 Darksaber Melissa — Rush, Assail; Fanfare: destroy a follower whose side has 3 cards, then Aura and no damage this turn", () => {
    const t = d({ me: { hand: ["BP18-026"], playPoints: 4 }, opp: { field: ["V5", "V3", "V1"] } }).play("BP18-026").pick("opp:V5");
    expect([t.field("opp"), t.keywords("BP18-026")]).toEqual([["V3", "V1"], ["rush", "assail", "aura"]]);
    const two = d({ me: { hand: ["BP18-026"], playPoints: 4 }, opp: { field: ["V5", "V3"] } }).play("BP18-026").pick("opp:V5");
    expect([two.field("opp"), two.keywords("BP18-026")]).toEqual([["V5", "V3"], ["rush", "assail"]]);
  });

  it("027 Gigabyte Blade — Fanfare: 2 counters on each Blade, buried with another Blade; a Togh Keyoh follower entering or an evolution: 1 counter", () => {
    const t = d({ me: { field: [giga(0)], hand: [BLADE], playPoints: 1 } }).play(BLADE);
    expect([t.field(), t.counters(BLADE, "gigabyte"), t.cemetery()]).toEqual([[BLADE], 2, [BLADE]]);
    const tk = d({ me: { field: [giga(0)], hand: ["BP18-032"], playPoints: 1 } }).play("BP18-032").flush();
    expect(tk.counters(BLADE, "gigabyte")).toBe(1);
    const evo = d({ me: { field: [giga(0), "BP18-011"], evolveDeck: ["BP18-012"], deck: ["V1", "V3", "V5"], playPoints: 1 } }).evolve("BP18-011").flush();
    expect(evo.counters(BLADE, "gigabyte")).toBe(1);
  });

  it("028 / 029 Cold Case Analyst — Assail; Fanfare: evolve with 3 Togh Keyoh cards; evolved: Strike, 2 counters on each Blade", () => {
    const t = d({ me: { hand: ["BP18-028"], field: ["BP18-005", giga(0)], evolveDeck: ["BP18-029"], playPoints: 2 } }).play("BP18-028").flush().yes().flush();
    expect([t.game.reader().info(t.id("BP18-028")).evolved, t.stats("BP18-028"), t.counters(BLADE, "gigabyte")]).toEqual([true, [4, 2], 2]);
    const s = d({ me: { field: [{ card: "BP18-028", evolvedInto: "BP18-029" }, giga(0)] } }).attack("BP18-028", "opp:leader");
    expect(s.counters(BLADE, "gigabyte")).toBe(2);
  });

  it("030 Lucius, Sellsword — Fanfare, (3): destroy an enemy follower", () => {
    const t = d({ me: { hand: ["BP18-030"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP18-030").yes();
    expect([t.field("opp"), t.pp()]).toEqual([[], 0]);
  });

  it("031 Unorthodox Assistance — a Shinra from the deck; 2 counters on each Blade", () => {
    const t = d({ me: { hand: ["BP18-031"], field: [giga(0)], deck: ["V1", "BP18-020"], playPoints: 1 } }).play("BP18-031").pick("BP18-020");
    expect([t.hand(), t.counters(BLADE, "gigabyte")]).toEqual([["BP18-020"], 2]);
  });

  it("032 / 033 Blind Spot Surveyor — Fanfare: leader +2 with 3 Togh Keyoh cards; evolved: a Togh Keyoh card from the top 3", () => {
    expect(d({ me: { hand: ["BP18-032"], field: ["BP18-005", giga(0)], playPoints: 1 } }).play("BP18-032").flush().leader()).toBe(22);
    const t = d({ me: { field: ["BP18-032"], evolveDeck: ["BP18-033"], deck: ["V1", "BP18-020", "V3"], playPoints: 1 } });
    t.evolve("BP18-032").pick("BP18-020").order();
    expect(t.hand()).toEqual(["BP18-020"]);
  });

  it("034 / 035 Monika, Cloudhall Admiral — Fanfare: 2 Knights; Strike and evolved: damage per follower of yours", () => {
    expect(d({ me: { hand: ["BP18-034"], playPoints: 5 } }).play("BP18-034").field()).toEqual(["BP18-034", KNIGHT, KNIGHT]);
    expect(d({ me: { field: ["BP18-034", "V1", "V1"] }, opp: { field: ["V5"] } }).attack("BP18-034", "opp:leader").stats("opp:V5")).toEqual([5, 2]);
    const e = d({ me: { field: ["BP18-034", "V1"], evolveDeck: ["BP18-035"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP18-034");
    expect(e.stats("opp:V5")).toEqual([5, 3]);
  });

  it("036 Princess Teena — Fanfare: a 1-cost follower from the deck into the EX area", () => {
    expect(d({ me: { hand: ["BP18-036"], deck: ["V3", "V1"], playPoints: 3 } }).play("BP18-036").pick("V1").ex()).toEqual(["V1"]);
  });

  it("037 Holy Bear Knight — Ward; Fanfare, (2): +2/+2 and draw", () => {
    const t = d({ me: { hand: ["BP18-037"], deck: ["V1"], playPoints: 4 } }).play("BP18-037").none().yes();
    expect([t.stats("BP18-037"), t.hand(), t.pp()]).toEqual([[4, 5], ["V1"], 0]);
  });

  it("038 Luminous Standard — Fanfare: the three Luminous cards from the deck; act, engage and bury it: a Commander follower +1/+1", () => {
    const t = d({ me: { hand: ["BP18-038"], deck: ["BP16-027", "V1", "BP16-029", "BP16-033"], playPoints: 3 } });
    t.play("BP18-038").pick("BP16-027").pick("BP16-029").pick("BP16-033");
    expect(t.hand()).toEqual(["BP16-027", "BP16-029", "BP16-033"]);
    const act = d({ me: { field: ["BP18-038", "BP18-034"] } }).activate("BP18-038");
    expect([act.stats("BP18-034"), act.field()]).toEqual([[5, 5], ["BP18-034"]]);
  });

  it("T02 All-Access Search — 3 counters on each Blade; draw 2", () => {
    const t = d({ me: { ex: [SEARCH], field: [giga(0)], deck: ["V1", "V3"], playPoints: 1 } }).play(`${SEARCH}@ex`);
    expect([t.counters(BLADE, "gigabyte"), t.hand()]).toEqual([3, ["V1", "V3"]]);
  });
});
