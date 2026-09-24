import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP02 Forestcraft (001–017). "V1".."V5" are vanilla test followers (cost N, V1 = 2/2, V2 = 2/3,
// V3 = 3/4, V5 = 5/5, Neutral).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const EVE = "BP02-T01";
const PIXIE = "BP01-013"; // Fairy Beast, a Pixie follower

describe("BP02 Forestcraft", () => {
  it("001 / 002 Crystalia Tia — Combo (3) summons Crystalia Eve; evolved: an Eve gets +1/+1 and Rush", () => {
    const combo = d({ me: { hand: ["V1", "V1", "BP02-001"], playPoints: 4 } }).play("V1").play("V1").play("BP02-001");
    expect(combo.field()).toEqual(["V1", "V1", "BP02-001", EVE]);
    expect(d({ me: { hand: ["BP02-001"], playPoints: 2 } }).play("BP02-001").field()).toEqual(["BP02-001"]);
    const evo = d({ me: { field: ["BP02-001", EVE], evolveDeck: ["BP02-002"], playPoints: 1 } }).evolve("BP02-001");
    expect([evo.stats(EVE), evo.keywords(EVE)]).toEqual([[5, 5], ["rush"]]);
  });

  it("003 White Wolf of Eldwood — Last Words: may put a Forestcraft follower from the top 4 onto the field", () => {
    const t = d({
      me: { field: [{ card: "BP02-003", damage: 3 }], deck: ["V1", "BP02-013", "V2", "V3", "V5"] },
      opp: { field: [{ card: "V2", engaged: true }] },
    });
    t.attack("BP02-003", "opp:V2").pick("BP02-013").order();
    expect([t.field(), t.leader()]).toEqual([["BP02-013"], 23]); // Elf Healer's fanfare
    expect(t.zone("me", "deck")).toEqual(["V5", "V1", "V2", "V3"]);
  });

  it("004 Elf Girl Liza — your followers take 1 less damage from enemy abilities (per Liza), not from attacks", () => {
    const one = d({ turn: 6, me: { field: ["BP02-004", "V3"] }, opp: { hand: ["BP01-179"], playPoints: 1 } });
    one.play("opp:BP01-179").pick("V3");
    expect(one.stats("V3")).toEqual([3, 3]);
    const two = d({ turn: 6, me: { field: ["BP02-004", "BP02-004", "V3"] }, opp: { hand: ["BP01-179"], playPoints: 1 } });
    two.play("opp:BP01-179").pick("V3");
    expect(two.stats("V3")).toEqual([3, 4]);
    const attack = d({ turn: 6, me: { field: ["BP02-004", { card: "V3", engaged: true }] }, opp: { field: ["V5"] } });
    attack.attack("opp:V5", "V3");
    expect(attack.field()).toEqual(["BP02-004"]);
  });

  it("005 Elf Knight Cynthia — Strike, banish an EX card: 2 damage and 2 Fairies", () => {
    const t = d({ me: { field: ["BP02-005"], ex: ["V1"] }, opp: { field: [{ card: "V2", engaged: true }] } });
    t.attack("BP02-005", "opp:V2").yes().pick("opp:leader");
    expect([t.leader("opp"), t.field(), t.ex(), t.zone("me", "banished")]).toEqual([18, ["BP02-005", "BP01-T03", "BP01-T03"], [], ["V1"]]);
    const noCost = d({ me: { field: ["BP02-005"] }, opp: { field: [{ card: "V2", engaged: true }] } }).attack("BP02-005", "opp:V2");
    expect(noCost.leader("opp")).toBe(20); // nothing to banish: the ability is not played
  });

  it("006 / 007 Grand Archer Selwyn — Combo (4): 5 damage; evolved destroys an enemy card with printed cost 3 or less", () => {
    const t = d({ me: { hand: ["V1", "V1", "V1", "BP02-006"], playPoints: 7 }, opp: { field: ["V5", "V3"] } });
    t.play("V1").play("V1").play("V1").play("BP02-006").pick("opp:V5");
    expect(t.field("opp")).toEqual(["V3"]);
    const noCombo = d({ me: { hand: ["BP02-006"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP02-006");
    expect(noCombo.stats("opp:V5")).toEqual([5, 5]);
    const evo = d({ me: { field: ["BP02-006"], evolveDeck: ["BP02-007"], playPoints: 1 }, opp: { field: ["V3", "V5", "AMULET"] } });
    evo.evolve("BP02-006").pick("opp:AMULET");
    expect(evo.field("opp")).toEqual(["V3", "V5"]);
  });

  it("008 / 009 Crystalia Lily — may take a Crystalian or Pixie follower from the top 2; evolved: an enemy follower to the bottom of its deck", () => {
    const t = d({ me: { hand: ["BP02-008"], deck: ["V1", "BP02-001", "V2"], playPoints: 2 } }).play("BP02-008").pick("BP02-001");
    expect([t.hand(), t.zone("me", "deck")]).toEqual([["BP02-001"], ["V2", "V1"]]);
    const evo = d({ me: { field: ["BP02-008"], evolveDeck: ["BP02-009"], playPoints: 2 }, opp: { field: ["V5", "V3"], deck: ["V1"] } });
    evo.evolve("BP02-008").pick("opp:V5");
    expect([evo.field("opp"), evo.zone("opp", "deck")]).toEqual([["V3"], ["V1", "V5"]]);
  });

  it("010 Baalt — choose: +2/+2 to a Pixie on your field (needs one) or search a Pixie follower", () => {
    const search = d({ me: { hand: ["BP02-010"], deck: ["V1", PIXIE], playPoints: 4 } }).play("BP02-010").pick(PIXIE);
    expect(search.hand()).toEqual([PIXIE]); // option (1) had no target, so (2) was the only choice
    const buff = d({ me: { hand: ["BP02-010"], field: [PIXIE], deck: [PIXIE], playPoints: 4 } }).play("BP02-010").choose("1");
    expect(buff.stats(PIXIE + "@field")).toEqual([7, 7]);
  });

  it("011 Elven Archery — up to 2 enemy followers take 1, or 2 with Combo (3); playable without targets", () => {
    const t = d({ me: { hand: ["BP02-011"], playPoints: 1 }, opp: { field: ["V2", "V3"] } }).play("BP02-011").pick("opp:V2", "opp:V3");
    expect([t.stats("opp:V2"), t.stats("opp:V3")]).toEqual([[2, 2], [3, 3]]);
    const combo = d({ me: { hand: ["V1", "V1", "BP02-011"], playPoints: 3 }, opp: { field: ["V2", "V3"] } });
    combo.play("V1").play("V1").play("BP02-011").pick("opp:V2", "opp:V3");
    expect([combo.stats("opp:V2"), combo.stats("opp:V3")]).toEqual([[2, 1], [3, 2]]);
    expect(d({ me: { hand: ["BP02-011"], playPoints: 1 } }).canPlay("BP02-011")).toBe(true);
  });

  it("012 Dwarf Perfurmer / 016 Elf Bard — whenever one of your followers evolves: 2 damage / a Fairy Wisp into EX", () => {
    const t = d({ me: { field: ["BP02-012", "BP02-016", "EVOLVER"], evolveDeck: ["EVOLVER-E"], playPoints: 2 }, opp: { field: ["V3"] } });
    t.evolve("EVOLVER").flush();
    expect([t.stats("opp:V3"), t.ex()]).toEqual([[3, 2], ["BP01-T02"]]);
  });

  it("013 Elf Healer — leader +3", () => {
    expect(d({ me: { hand: ["BP02-013"], playPoints: 3 } }).play("BP02-013").leader()).toBe(23);
  });

  it("014 / 015 Forest Gigas — Ward; +X attack for cards in your EX area; evolved deals X equal to its attack", () => {
    const t = d({ me: { hand: ["BP02-014"], ex: ["V1", "V2"], playPoints: 6 } }).play("BP02-014").none();
    expect([t.stats("BP02-014"), t.keywords("BP02-014")]).toEqual([[3, 7], ["ward"]]);
    const evo = d({ me: { field: ["BP02-014"], evolveDeck: ["BP02-015"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP02-014");
    expect(evo.stats("opp:V5")).toEqual([5, 2]);
  });

  it("017 Rose Deer — Rush; a Thorn Burst token into your EX area", () => {
    const t = d({ me: { hand: ["BP02-017"], playPoints: 4 } }).play("BP02-017");
    expect([t.ex(), t.keywords("BP02-017")]).toEqual([["BP01-T01"], ["rush"]]);
  });
});
