import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP13 Forestcraft (001–018). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC destroys one of your
// followers. FOREST_SPELLS are 5 Forestcraft spells with different names; BP13-011 Wildwood Warrior is a
// 5-cost Beast follower; BP12-T01 Carbuncle's Sparkle can return a follower to its owner's hand. Tokens:
// BP01-T03 Fairy, BP01-T02 Fairy Wisp, BP13-T05 Keenedge Artifact, BP05-T05 Mystic Artifact.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const FAIRY = "BP01-T03";
const WISP = "BP01-T02";
const FOREST_SPELLS = ["BP13-008", "BP12-007", "BP11-016", "BP11-011", "BP11-017"];
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP13 Forestcraft", () => {
  it("001 Sekka, Fatebound Fox — a Forestcraft card that costs 2 or less from the top 3, then discard; from the cemetery (3), banish it and 2 others: may summon Sekka, Ninefold Blaze", () => {
    const t = d({ me: { hand: ["BP13-001", "V5"], deck: ["V5", "BP13-013", "V3"], playPoints: 1 } }).play("BP13-001").pick("BP13-013").order().pick("V5");
    expect([t.hand(), t.cemetery()]).toEqual([["BP13-013"], ["V5"]]);
    expect(d({ me: { hand: ["BP13-001", "V5"], deck: ["V5", "BP13-013", "V3"], playPoints: 1 } }).play("BP13-001").none().order().hand()).toEqual(["V5"]);
    const act = d({ me: { cemetery: ["BP13-001", "V1", "V3", "V5"], evolveDeck: ["BP13-002"], playPoints: 3 } });
    act.activate("BP13-001").pick("V1", "V3").pick("BP13-002");
    expect([act.field(), act.zone("me", "banished"), act.cemetery(), act.pp()]).toEqual([["BP13-002"], ["BP13-001", "V1", "V3"], ["V5"], 0]);
  });

  it("002 Sekka, Ninefold Blaze — search a Resolve of the Nine-Tailed Fox, or take one from the cemetery", () => {
    const search = d({ me: { ex: ["BP13-002"], cemetery: ["BP13-008"], deck: ["V1", "BP13-008"], playPoints: 3 } }).play("BP13-002@ex").choose("search").pick("BP13-008");
    expect([search.hand(), search.cemetery()]).toEqual([["BP13-008"], ["BP13-008"]]);
    const back = d({ me: { ex: ["BP13-002"], cemetery: ["BP13-008"], deck: ["V1", "BP13-008"], playPoints: 3 } }).play("BP13-002@ex").choose("cemetery");
    expect([back.hand(), back.cemetery()]).toEqual([["BP13-008"], []]);
  });

  it("003 / 004 Aria, Miasma Fairy — not from the EX area; Pixie token followers have Rush while it is on the field or in the EX area; a Fairy into the EX area; Last Words: may go into the EX area", () => {
    expect(d({ me: { ex: ["BP13-003"], playPoints: 3 } }).canPlay("BP13-003@ex")).toBe(false);
    expect(d({ me: { hand: ["BP13-003"], playPoints: 3 } }).play("BP13-003").ex()).toEqual([FAIRY]);
    const ex = d({ me: { ex: ["BP13-003"], field: [FAIRY, "V1"] } });
    expect([ex.keywords(FAIRY), ex.keywords("V1")]).toEqual([["rush"], []]);
    expect(d({ me: { field: ["BP13-003", FAIRY] } }).keywords(FAIRY)).toEqual(["rush"]);
    expect(d({ me: { cemetery: ["BP13-003"], field: [FAIRY] } }).keywords(FAIRY)).toEqual([]);
    expect(d({ me: { field: ["BP13-003"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").yes().ex()).toEqual(["BP13-003"]);
    const evo = d({ me: { field: ["BP13-003"], evolveDeck: ["BP13-004"], deck: ["V1", "BP13-012"], playPoints: 1 } }).evolve("BP13-003").pick("BP13-012");
    expect([evo.field(), evo.ex()]).toEqual([["BP13-003", "BP13-012"], [FAIRY]]);
    const lw = d({ me: { field: [{ card: "BP13-003", evolvedInto: "BP13-004" }], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").yes();
    expect(lw.ex()).toEqual(["BP13-003"]);
  });

  it("005 / 006 Nelcha — Strike with 5 Forestcraft spell names in the cemetery: -2/-2 to an enemy follower, +2/+2 to itself; evolved: a Forestcraft spell to the hand and one to the cemetery from the top 5", () => {
    const t = d({ me: { field: ["BP13-005"], cemetery: FOREST_SPELLS }, opp: { field: ["V5", { card: "V3", engaged: true }] } });
    t.attack("BP13-005", "opp:V3").pick("opp:V5");
    expect([t.stats("opp:V5"), t.stats("BP13-005"), t.field("opp")]).toEqual([[3, 3], [4, 1], ["V5"]]);
    const four = d({ me: { field: ["BP13-005"], cemetery: [...FOREST_SPELLS.slice(1), "BP12-007"] }, opp: { field: ["V5", { card: "V3", engaged: true }] } });
    four.attack("BP13-005", "opp:V3").pick("opp:V5");
    expect(four.stats("opp:V5")).toEqual([5, 5]);
    const evo = d({ me: { field: ["BP13-005"], evolveDeck: ["BP13-006"], deck: ["BP13-008", "V1", "BP12-007", "V3", "V5"], playPoints: 1 } });
    evo.evolve("BP13-005").pick("BP13-008").pick("BP12-007").order();
    expect([evo.hand(), evo.cemetery(), evo.zone("me", "deck").length]).toEqual([["BP13-008"], ["BP12-007"], 3]);
  });

  it("007 Spinaria — engage and banish 3 cards from the cemetery: a Keenedge Artifact and a Mystic Artifact", () => {
    const t = d({ me: { field: ["BP13-007"], cemetery: n(3), deck: ["V1"] } }).activate("BP13-007").none();
    expect([t.field(), t.zone("me", "banished"), t.hand()]).toEqual([["BP13-007", "BP13-T05", "BP05-T05"], n(3), ["V1"]]);
  });

  it("008 Resolve of the Nine-Tailed Fox — up to 2: Ninefold Blaze +2/+2 and Storm with 9 banished cards; a Sekka +2/+2, then damage equal to its attack", () => {
    const t = d({ me: { hand: ["BP13-008"], field: ["BP13-001"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP13-008");
    expect([t.stats("BP13-001"), t.stats("opp:V5")]).toEqual([[3, 3], [5, 2]]);
    const both = d({ me: { hand: ["BP13-008"], field: ["BP13-002"], banished: n(9), playPoints: 1 }, opp: { field: ["V5"] } }).play("BP13-008").choose("blaze", "strike");
    expect([both.stats("BP13-002"), both.keywords("BP13-002"), both.field("opp")]).toEqual([[7, 7], ["storm"], []]);
    const eight = d({ me: { hand: ["BP13-008"], field: ["BP13-002"], banished: n(8), playPoints: 1 } }).play("BP13-008");
    expect([eight.stats("BP13-002"), eight.keywords("BP13-002")]).toEqual([[3, 3], []]);
    expect(d({ me: { hand: ["BP13-008"], field: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).canPlay("BP13-008")).toBe(false);
  });

  it("009 / 010 Sunbright Elf — Pixie token followers in the EX area +1/+1; evolved: up to 2 of them onto the field", () => {
    const t = d({ me: { hand: ["BP13-009"], ex: [FAIRY, "V1"], playPoints: 3 } }).play("BP13-009");
    expect([t.stats(FAIRY), t.stats("V1")]).toEqual([[2, 2], [2, 2]]);
    const evo = d({ me: { field: ["BP13-009"], evolveDeck: ["BP13-010"], ex: [FAIRY, FAIRY, FAIRY], playPoints: 1 } }).evolve("BP13-009").pick(FAIRY, FAIRY);
    expect([evo.field(), evo.ex()]).toEqual([["BP13-009", FAIRY, FAIRY], [FAIRY]]);
  });

  it("011 Wildwood Warrior — a Beast follower from the top 4; engage: may summon a Beast follower that costs 4 or less from the hand", () => {
    const t = d({ me: { hand: ["BP13-011"], deck: ["V1", "BP13-016", "V3", "V5"], playPoints: 5 } }).play("BP13-011").pick("BP13-016").order();
    expect(t.hand()).toEqual(["BP13-016"]);
    const act = d({ me: { field: ["BP13-011"], hand: ["BP13-016", "V1"] } }).activate("BP13-011").pick("BP13-016");
    expect([act.field(), act.engaged("BP13-011")]).toEqual([["BP13-011", "BP13-016"], true]);
  });

  it("012 Tree of Wonders — a Fairy into the EX area; engage and bury with 3 Pixie followers in the EX area: draw 2", () => {
    expect(d({ me: { hand: ["BP13-012"], playPoints: 2 } }).play("BP13-012").ex()).toEqual([FAIRY]);
    const act = d({ me: { field: ["BP13-012"], ex: [FAIRY, FAIRY, FAIRY], deck: ["V1", "V3"] } }).activate("BP13-012");
    expect([act.hand(), act.field()]).toEqual([["V1", "V3"], []]);
    expect(d({ me: { field: ["BP13-012"], ex: [FAIRY, FAIRY] } }).canActivate("BP13-012")).toBe(false);
  });

  it("013 / 014 Fairy Slugger — evolved: a Fairy Wisp and a Fairy into the EX area, leader +2 with 3 Pixie followers there", () => {
    const t = d({ me: { field: ["BP13-013"], evolveDeck: ["BP13-014"], ex: [FAIRY], playPoints: 1 } }).evolve("BP13-013");
    expect([t.ex(), t.leader()]).toEqual([[FAIRY, WISP, FAIRY], 22]);
    // Room for one: its controller chooses which (ruling).
    const room = d({ me: { field: ["BP13-013"], evolveDeck: ["BP13-014"], ex: ["V1", "V1", "V1", "V1"], playPoints: 1 } }).evolve("BP13-013").choose("Fairy Wisp");
    expect([room.ex(), room.leader()]).toEqual([["V1", "V1", "V1", "V1", WISP], 20]);
  });

  it("015 Edgy Elf — Storm; Strike: banish the top 3 of the deck for +1/+1", () => {
    const t = d({ me: { field: ["BP13-015"], deck: ["V1", "V3", "V5"] } }).attack("BP13-015", "opp:leader").yes();
    expect([t.leader("opp"), t.zone("me", "banished"), t.stats("BP13-015")]).toEqual([17, ["V1", "V3", "V5"], [3, 3]]);
    expect(d({ me: { field: ["BP13-015"], deck: ["V1", "V3"] } }).attack("BP13-015", "opp:leader").leader("opp")).toBe(18);
  });

  it("016 Gazania Fox — 1 less after a Beast follower returned to your hand this turn; 1 damage, or 4 and Aura with a Beast follower that costs 5 or more", () => {
    const cheap = d({ me: { ex: ["BP12-T01"], field: ["BP13-011"], hand: ["BP13-016"], playPoints: 3 } }).play("BP12-T01").choose("return");
    expect([cheap.hand(), cheap.pp(), cheap.canPlay("BP13-016")]).toEqual([["BP13-016", "BP13-011"], 1, true]);
    expect(d({ me: { hand: ["BP13-016"], playPoints: 1 } }).canPlay("BP13-016")).toBe(false);
    const big = d({ me: { hand: ["BP13-016"], field: ["BP13-011"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP13-016");
    expect([big.stats("opp:V5"), big.keywords("BP13-016")]).toEqual([[5, 1], ["aura"]]);
    const small = d({ me: { hand: ["BP13-016"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP13-016");
    expect([small.stats("opp:V5"), small.keywords("BP13-016")]).toEqual([[5, 4], []]);
  });

  it("017 Tower Root Giant — Ward; at your end phase an enemy follower is engaged and doesn't refresh in its controller's next start phase", () => {
    const t = d({ me: { field: ["BP13-017"] }, opp: { field: ["V5"], deck: ["V1"] } }).end();
    expect([t.engaged("opp:V5"), t.keywords("BP13-017")]).toEqual([true, ["ward"]]);
  });

  it("018 Feybolt Archer — a Fairy onto the field and a Pixie card from the top 3", () => {
    const t = d({ me: { hand: ["BP13-018"], deck: ["V1", "BP13-013", "V3"], playPoints: 2 } }).play("BP13-018").pick("BP13-013").order();
    expect([t.field(), t.hand()]).toEqual([["BP13-018", FAIRY], ["BP13-013"]]);
  });
});
