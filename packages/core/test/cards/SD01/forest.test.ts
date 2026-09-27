import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// SD01 (Forestcraft starter deck). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). BP01-T03 is the Fairy token (1/1 Pixie follower).
// QUICK-SAC (0) destroys a follower of yours.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const FAIRY = "BP01-T03";

describe("SD01 Forestcraft", () => {
  it("001 Aria, Fairy Princess — Ward; Fanfare: any number of 9 Fairies onto the field and into the EX area; other Pixie followers have Rush", () => {
    const t = d({ me: { hand: ["SD01-001"], playPoints: 6 } }).play("SD01-001").none().choose("3").choose("2");
    expect([t.field(), t.ex(), t.keywords(FAIRY), t.keywords("SD01-001")]).toEqual([
      ["SD01-001", FAIRY, FAIRY, FAIRY],
      [FAIRY, FAIRY],
      ["rush"],
      ["ward"],
    ]);
    // 0 is allowed (ruling).
    expect(d({ me: { hand: ["SD01-001"], playPoints: 6 } }).play("SD01-001").none().choose("0").choose("0").ex()).toEqual([]);
  });

  it("002 Titania's Sanctuary — Fanfare: +1/+1 to Pixie tokens on the field (not the EX area); entering ones get +1/+1; they have Assail", () => {
    const t = d({ me: { hand: ["SD01-002"], field: [FAIRY], ex: [FAIRY], playPoints: 2 } }).play("SD01-002");
    expect([t.stats(`${FAIRY}@field`), t.stats(`${FAIRY}@ex`), t.keywords(`${FAIRY}@field`)]).toEqual([[2, 2], [1, 1], ["assail"]]);
    const s = d({ me: { field: ["SD01-002"], hand: ["SD01-006"], playPoints: 4 } }).play("SD01-006").flush();
    expect(s.ids(`${FAIRY}@field`).map((id) => s.game.reader().info(id).attack)).toEqual([2, 2, 2]);
  });

  it("003 / 004 Rose Gardener — evolved: return an enemy follower; Combo (3): draw", () => {
    const t = d({ me: { field: ["SD01-003"], evolveDeck: ["SD01-004"], deck: ["V1"], playPoints: 1, playedThisTurn: 3 }, opp: { field: ["V5"] } });
    t.evolve("SD01-003");
    expect([t.hand("opp"), t.hand()]).toEqual([["V5"], ["V1"]]);
    const n = d({ me: { field: ["SD01-003"], evolveDeck: ["SD01-004"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("SD01-003");
    expect([n.hand("opp"), n.hand()]).toEqual([["V5"], []]);
  });

  it("005 Waltzing Fairy — Fanfare and Last Words: a Fairy into the EX area", () => {
    expect(d({ me: { hand: ["SD01-005"], playPoints: 3 } }).play("SD01-005").ex()).toEqual([FAIRY]);
    expect(d({ me: { field: ["SD01-005"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual([FAIRY]);
  });

  it("006 Fairy Caster — Fanfare: 3 Fairies, the ones that don't fit into the EX area", () => {
    const t = d({ me: { hand: ["SD01-006"], field: ["V1", "V1", "V1"], playPoints: 4 } }).play("SD01-006");
    expect([t.field(), t.ex()]).toEqual([["V1", "V1", "V1", "SD01-006", FAIRY], [FAIRY, FAIRY]]);
  });

  it("009 / 010 Treant — Fanfare, Combo (3): its Evolve cost becomes 0", () => {
    const t = d({ me: { hand: ["SD01-009"], evolveDeck: ["SD01-010"], playPoints: 3, playedThisTurn: 2 } }).play("SD01-009");
    expect(t.pp()).toBe(0);
    expect(t.evolve("SD01-009").stats("SD01-009")).toEqual([5, 5]);
    expect(d({ me: { hand: ["SD01-009"], evolveDeck: ["SD01-010"], playPoints: 3 } }).play("SD01-009").canEvolve("SD01-009")).toBe(false);
  });

  it("011 / 012 Water Fairy — Last Words: a Fairy into the EX area; evolved: On Evolve, summon a Fairy", () => {
    expect(d({ me: { field: ["SD01-011"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").ex()).toEqual([FAIRY]);
    expect(d({ me: { field: ["SD01-011"], evolveDeck: ["SD01-012"], playPoints: 2 } }).evolve("SD01-011").field()).toEqual(["SD01-011", FAIRY]);
  });

  it("013 Elf Wanderer — Assail; ignores Ward", () => {
    const t = d({ me: { field: ["SD01-013"] }, opp: { field: [{ card: "WARD", engaged: true }, "V1"] } });
    expect(t.attackTargets("SD01-013").sort()).toEqual(["V1", "WARD", "opp:leader"]);
  });

  it("016 Sylvan Justice — Quick: 3 damage and a Fairy into the EX area", () => {
    const t = d({ me: { hand: ["SD01-016"], playPoints: 2 }, opp: { field: ["V5"] } }).play("SD01-016");
    expect([t.stats("opp:V5"), t.ex()]).toEqual([[5, 2], [FAIRY]]);
  });
});
