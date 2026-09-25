import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP06 Runecraft (035–053). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5; KILL is a 1-cost spell. BP06-042
// Shikigami Summons is an Onmyoji (陰陽師) spell; BP06-T01 Celestial Shikigami and BP06-T02 Paper
// Shikigami are Shikigami (式神) tokens; BP01-T10 Magic Sediment is a Stack amulet.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ONMYOJI7 = Array<string>(7).fill("BP06-042");

describe("BP06 Runecraft", () => {
  it("035 / 036 Kuon / Koyori — 1 less per spell or Onmyoji card in the cemetery; a Celestial Shikigami; engage: Storm to Shikigami", () => {
    for (const card of ["BP06-035", "BP06-036"]) {
      const t = d({ me: { hand: [card], cemetery: Array<string>(10).fill("BP06-042"), playPoints: 5 } }).play(card);
      expect([t.pp(), t.field()]).toEqual([0, [card, "BP06-T01"]]);
      t.activate(card).pick("BP06-T01");
      expect(t.keywords("BP06-T01")).toEqual(["aura", "storm"]);
    }
    const second = d({ me: { hand: ["BP06-035"], field: ["BP06-T01"], cemetery: Array<string>(12).fill("KILL"), playPoints: 3 } }).play("BP06-035");
    expect(second.field()).toEqual(["BP06-T01", "BP06-035"]);
  });

  it("037 / 038 Mysteria — reveal an Academic follower for 2 damage; Academic followers cost 1 less; evolved: 3 damage", () => {
    const t = d({ me: { hand: ["BP06-037", "BP06-037"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP06-037").yes();
    expect([t.stats("opp:V5"), t.canPlay("BP06-037")]).toEqual([[5, 3], true]);
    t.play("BP06-037"); // no Academic follower left in hand to reveal
    expect(t.pp()).toBe(0);
    const evo = d({ me: { field: ["BP06-037"], evolveDeck: ["BP06-038"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP06-037");
    expect(evo.stats("opp:V5")).toEqual([5, 2]);
  });

  it("039 / 040 Curse Crafter — a Paper Shikigami; bury a Shikigami for 4 damage, then no more activating this turn", () => {
    const t = d({ me: { hand: ["BP06-039"], deck: ["V1"], playPoints: 4 }, opp: { field: ["V5", "V3"] } }).play("BP06-039");
    expect(t.field()).toEqual(["BP06-039", "BP06-T02"]);
    t.activate("BP06-039").pick("opp:V5");
    // The Paper Shikigami's Last Words: draw, then discard the drawn card.
    expect([t.stats("opp:V5"), t.canActivate("BP06-039"), t.cemetery()]).toEqual([[5, 1], false, ["V1"]]);
    const evo = d({ me: { field: ["BP06-039"], evolveDeck: ["BP06-040"], cemetery: ONMYOJI7, playPoints: 1 }, opp: { field: ["V5"] } });
    expect(evo.evolve("BP06-039").stats("opp:V5")).toEqual([5, 1]);
  });

  it("041 Hulking Giant — Earth Rite: 5 damage on Fanfare, 3 to the enemy leader on Last Words", () => {
    const t = d({ me: { hand: ["BP06-041"], field: ["BP01-T10"], playPoints: 5 }, opp: { field: ["V5"] } }).play("BP06-041").yes();
    expect([t.field(), t.field("opp")]).toEqual([["BP06-041"], []]);
    const lw = d({ me: { field: ["BP06-041", "BP01-T10"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").yes();
    expect(lw.leader("opp")).toBe(17);
  });

  it("042 / 043 Shikigami Summons / Koyo's Big Invention — a Paper Shikigami; draw with 7 spells and Onmyoji cards", () => {
    for (const card of ["BP06-042", "BP06-043"]) {
      const t = d({ me: { hand: [card], cemetery: ONMYOJI7, deck: ["V1"] } }).play(card);
      expect([t.field(), t.hand()]).toEqual([["BP06-T02"], ["V1"]]);
    }
    expect(d({ me: { hand: ["BP06-042"], deck: ["V1"] } }).play("BP06-042").hand()).toEqual([]);
  });

  it("044 / 045 Demoncaller — Shikigami entering get +1/+0 and Rush; evolved summons a Paper Shikigami", () => {
    const t = d({ me: { field: ["BP06-044"], hand: ["BP06-042"] } }).play("BP06-042");
    expect([t.stats("BP06-T02"), t.keywords("BP06-T02")]).toEqual([[3, 2], ["rush"]]);
    const evo = d({ me: { field: ["BP06-044"], evolveDeck: ["BP06-045"], playPoints: 1 } }).evolve("BP06-044");
    expect([evo.field(), evo.stats("BP06-T02")]).toEqual([["BP06-044", "BP06-T02"], [3, 2]]);
  });

  it("046 Traditional Sorcerer — Shikigami entering get Ward; with 7 spells and Onmyoji cards: a Paper Shikigami and leader +2", () => {
    const t = d({ me: { hand: ["BP06-046"], cemetery: ONMYOJI7 } }).play("BP06-046");
    expect([t.field(), t.keywords("BP06-T02"), t.leader()]).toEqual([["BP06-046", "BP06-T02"], ["ward"], 22]);
    expect(d({ me: { hand: ["BP06-046"] } }).play("BP06-046").leader()).toBe(20);
  });

  it("047 Crimson Meteor Storm — 2 less with Spellchain (10); 6 to each enemy follower and 3 to the enemy leader", () => {
    const t = d({ me: { hand: ["BP06-047"], cemetery: Array<string>(10).fill("KILL"), playPoints: 5 }, opp: { field: ["V5", "V3"] } });
    t.play("BP06-047");
    expect([t.field("opp"), t.leader("opp"), t.pp()]).toEqual([[], 17, 0]);
  });

  it("048 Talisman Disciple — Last Words: search a Shikigami Summons", () => {
    const t = d({ me: { field: ["BP06-048"], hand: ["QUICK-SAC"], deck: ["V1", "BP06-042"] } }).play("QUICK-SAC").pick("BP06-042");
    expect(t.hand()).toEqual(["BP06-042"]);
  });

  it("049 / 050 Charming Gentlemouse — pay 2 to summon another; evolved: twice the Gentlemice in damage", () => {
    const t = d({ me: { hand: ["BP06-049"], deck: ["V1", "BP06-049"], playPoints: 4 } }).play("BP06-049").yes().pick("BP06-049");
    expect([t.field(), t.pp()]).toEqual([["BP06-049", "BP06-049"], 0]);
    const evo = d({ me: { field: ["BP06-049", "BP06-049"], evolveDeck: ["BP06-050"], playPoints: 1 }, opp: { field: ["V5"] } });
    expect(evo.evolve("BP06-049").stats("opp:V5")).toEqual([5, 1]);
  });

  it("051 Passionate Potioneer — Fanfare and Last Words: a Magic Sediment", () => {
    const t = d({ me: { hand: ["BP06-051", "QUICK-SAC"] } }).play("BP06-051");
    expect([t.field(), t.counters("BP01-T10", "stack")]).toEqual([["BP06-051", "BP01-T10"], 1]);
    t.play("QUICK-SAC");
    expect(t.field()).toEqual(["BP01-T10", "BP01-T10"]);
  });

  it("052 Golem's Rampage — bury a Golem follower: 3 to each enemy", () => {
    const t = d({ me: { hand: ["BP06-052"], field: ["BP01-T08"] }, opp: { field: ["V3"] } }).play("BP06-052").yes();
    expect([t.field(), t.stats("opp:V3"), t.leader("opp")]).toEqual([[], [3, 1], 17]);
    const none = d({ me: { hand: ["BP06-052"] }, opp: { field: ["V3"] } }).play("BP06-052");
    expect(none.leader("opp")).toBe(20);
  });

  it("053 Mirror of Truth — Stack; summon an Alchemist follower costing 3 or less from the cemetery", () => {
    const t = d({ me: { hand: ["BP06-053"], cemetery: ["BP06-051", "V1"] } }).play("BP06-053");
    expect([t.field(), t.counters("BP06-053", "stack")]).toEqual([["BP06-053", "BP06-051", "BP01-T10"], 1]);
  });
});
