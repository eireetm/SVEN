import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP12 Forestcraft (001–017, T01). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral); AMULET a 1-cost
// amulet; QUICK-SAC destroys one of your followers. BP12-014 Springleaf Sprite is a Natura follower;
// BP01-014 Noble Fairy has the Pixie and Princess traits. Tokens: BP01-T03 Fairy (Pixie), BP07-T03
// Naterran Great Tree, BP12-T01 Carbuncle's Sparkle.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const FAIRY = "BP01-T03";
const TREE = "BP07-T03";
const SPARKLE = "BP12-T01";
const natura = (n: number) => Array<string>(n).fill("BP12-014");

describe("BP12 Forestcraft", () => {
  it("001 Awakened Gaia — 5 less for every 5 Natura cards in the cemetery; Fanfare destroys an enemy follower", () => {
    const t = d({ me: { hand: ["BP12-001"], cemetery: natura(5), playPoints: 6, maxPlayPoints: 6 }, opp: { field: ["V5"] } }).play("BP12-001");
    expect([t.field("opp"), t.pp()]).toEqual([[], 0]);
    expect(d({ me: { hand: ["BP12-001"], cemetery: natura(10), playPoints: 1, maxPlayPoints: 1 } }).canPlay("BP12-001")).toBe(true);
    expect(d({ me: { hand: ["BP12-001"], cemetery: natura(9), playPoints: 5, maxPlayPoints: 5 } }).canPlay("BP12-001")).toBe(false);
  });

  it("002 / 003 Elf Queen of Abundant Life — Fanfare Combo (3) draws; evolved: 2 damage divided, 4 with Combo (3)", () => {
    expect(d({ me: { hand: ["BP12-002"], deck: ["V1"], playedThisTurn: 2, playPoints: 2 } }).play("BP12-002").hand()).toEqual(["V1"]);
    expect(d({ me: { hand: ["BP12-002"], deck: ["V1"], playedThisTurn: 1, playPoints: 2 } }).play("BP12-002").hand()).toEqual([]);
    const evo = d({ me: { field: ["BP12-002"], evolveDeck: ["BP12-003"], playPoints: 1 }, opp: { field: ["V5", "V3"] } });
    evo.evolve("BP12-002").pick("opp:V5", "opp:V3");
    expect([evo.stats("opp:V5"), evo.stats("opp:V3")]).toEqual([[5, 4], [3, 3]]);
    const combo = d({ me: { field: ["BP12-002"], evolveDeck: ["BP12-003"], playedThisTurn: 3, playPoints: 1 }, opp: { field: ["V5", "V3"] } });
    combo.evolve("BP12-002").pick("opp:V5", "opp:V3").choose("3");
    expect([combo.stats("opp:V5"), combo.stats("opp:V3")]).toEqual([[5, 2], [3, 3]]);
  });

  it("004 / 005 Carbuncle — a Sparkle into the EX area; evolved: another, and each Sparkle there costs 2 less", () => {
    expect(d({ me: { hand: ["BP12-004"], playPoints: 4 } }).play("BP12-004").ex()).toEqual([SPARKLE]);
    const evo = d({ me: { field: ["BP12-004"], evolveDeck: ["BP12-005"], ex: [SPARKLE], playPoints: 2 } }).evolve("BP12-004");
    expect([evo.ex(), evo.pp(), evo.canPlay(`${SPARKLE}@ex`)]).toEqual([[SPARKLE, SPARKLE], 0, true]);
  });

  it("006 Irene — Rush, Assail; no damage during your turn; Strike draws and refreshes once a turn", () => {
    const t = d({ me: { field: ["BP12-006"], deck: ["V1", "V3"] }, opp: { field: [{ card: "V5", engaged: true }] } }).attack("BP12-006", "opp:V5");
    expect([t.stats("BP12-006"), t.field("opp"), t.hand(), t.engaged("BP12-006"), t.keywords("BP12-006")]).toEqual([[6, 6], [], ["V1"], false, ["rush", "assail"]]);
    t.attack("BP12-006", "opp:leader");
    expect([t.hand(), t.engaged("BP12-006"), t.leader("opp")]).toEqual([["V1"], true, 14]);
    const opp = d({ turn: 6, me: { field: [{ card: "BP12-006", engaged: true }] }, opp: { field: ["V5"] } }).attack("opp:V5", "BP12-006");
    expect([opp.stats("BP12-006"), opp.field("opp")]).toEqual([[6, 1], []]);
  });

  it("007 Intertwined Resolve — (1) a Natura card from your field into the EX area: 3 damage; (2) 2 Fairies", () => {
    const t = d({ me: { hand: ["BP12-007"], field: ["BP12-014"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP12-007").choose("damage").yes();
    expect([t.stats("opp:V5"), t.field(), t.ex()]).toEqual([[5, 2], [], ["BP12-014", TREE]]);
    const fairies = d({ me: { hand: ["BP12-007"], field: ["BP12-014"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP12-007").choose("fairies");
    expect(fairies.field()).toEqual(["BP12-014", FAIRY, FAIRY]);
    // The process is optional: not executed, the option does nothing.
    const no = d({ me: { hand: ["BP12-007"], field: ["BP12-014"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP12-007").choose("damage").no();
    expect([no.stats("opp:V5"), no.field()]).toEqual([[5, 5], ["BP12-014"]]);
  });

  it("008 / 009 Forest Defender — another Hunter attacking deals 3; evolved: may summon a Hunter that costs 3 or less from the top 4", () => {
    const t = d({ me: { field: ["BP12-008", "BP12-015"] }, opp: { field: ["V5", "V3"] } }).attack("BP12-015", "opp:leader").pick("opp:V5");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 2], 18]);
    expect(d({ me: { field: ["BP12-008"] }, opp: { field: ["V5"] } }).attack("BP12-008", "opp:leader").stats("opp:V5")).toEqual([5, 5]);
    const evo = d({ me: { field: ["BP12-008"], evolveDeck: ["BP12-009"], deck: ["V1", "BP12-015", "V3", "V5"], playPoints: 1 } });
    evo.evolve("BP12-008").pick("BP12-015").order();
    expect(evo.field()).toEqual(["BP12-008", "BP12-015"]);
  });

  it("010 Windfall Fay — during your turn, the 3rd card played gives leader +1 and the 5th draws", () => {
    expect(d({ me: { field: ["BP12-010"], hand: ["AMULET"], playedThisTurn: 2 } }).play("AMULET").leader()).toBe(21);
    const fourth = d({ me: { field: ["BP12-010"], hand: ["AMULET"], deck: ["V1"], playedThisTurn: 3 } }).play("AMULET");
    expect([fourth.leader(), fourth.hand()]).toEqual([20, []]);
    expect(d({ me: { field: ["BP12-010"], hand: ["AMULET"], deck: ["V1"], playedThisTurn: 4 } }).play("AMULET").hand()).toEqual(["V1"]);
    // Itself as the 3rd card: it isn't on the field yet (ruling).
    expect(d({ me: { hand: ["BP12-010"], playedThisTurn: 2, playPoints: 1 } }).play("BP12-010").leader()).toBe(20);
  });

  it("011 Aria's Whirlwind — 1 less with a Pixie Princess follower in the EX area; damage equal to a Pixie token's attack to each enemy follower", () => {
    const t = d({ me: { hand: ["BP12-011"], field: [FAIRY], playPoints: 4 }, opp: { field: ["V1", "V3"] } }).play("BP12-011");
    expect([t.stats("opp:V1"), t.stats("opp:V3")]).toEqual([[2, 1], [3, 3]]);
    expect(d({ me: { hand: ["BP12-011"], field: [FAIRY], ex: ["BP01-014"], playPoints: 3 }, opp: { field: ["V1"] } }).canPlay("BP12-011")).toBe(true);
    expect(d({ me: { hand: ["BP12-011"], field: [FAIRY], ex: [FAIRY], playPoints: 3 }, opp: { field: ["V1"] } }).canPlay("BP12-011")).toBe(false);
    expect(d({ me: { hand: ["BP12-011"], field: ["V1"], playPoints: 4 } }).canPlay("BP12-011")).toBe(false);
  });

  it("012 / 013 Forest Hatcheteer — Rush; Strike 2 damage; evolved: Strike destroys and 3 to its leader", () => {
    const t = d({ me: { field: ["BP12-012"] }, opp: { field: ["V5", { card: "V1", engaged: true }] } }).attack("BP12-012", "opp:V1").pick("opp:V5");
    expect([t.stats("opp:V5"), t.field("opp"), t.stats("BP12-012"), t.keywords("BP12-012")]).toEqual([[5, 3], ["V5"], [3, 1], ["rush"]]);
    const evo = d({ me: { field: [{ card: "BP12-012", evolvedInto: "BP12-013" }] }, opp: { field: ["V5", "V3"] } }).attack("BP12-012", "opp:leader").pick("opp:V5");
    expect([evo.field("opp"), evo.leader("opp")]).toEqual([["V3"], 11]);
  });

  it("014 Springleaf Sprite — a Tree into the EX area when it enters and when it leaves", () => {
    const t = d({ me: { hand: ["BP12-014", "QUICK-SAC"], playPoints: 1 } }).play("BP12-014");
    expect(t.ex()).toEqual([TREE]);
    expect(t.play("QUICK-SAC").ex()).toEqual([TREE, TREE]);
  });

  it("015 Elven Pikeman — Storm", () => {
    expect(d({ me: { hand: ["BP12-015"], playPoints: 2 } }).play("BP12-015").attack("BP12-015", "opp:leader").leader("opp")).toBe(18);
  });

  it("016 Fairy Officer — 2 Fairies into the EX area, then damage equal to the Pixie tokens there", () => {
    const t = d({ me: { hand: ["BP12-016"], ex: [FAIRY], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP12-016");
    expect([t.ex(), t.stats("opp:V5")]).toEqual([[FAIRY, FAIRY, FAIRY], [5, 2]]);
  });

  it("017 Fairy Menhir — a Pixie card from the top 3; engage and bury: leader +1 with 3 Pixie followers in the EX area", () => {
    const t = d({ me: { hand: ["BP12-017"], deck: ["V1", "BP12-010", "V3"], playPoints: 1 } }).play("BP12-017").pick("BP12-010").order();
    expect(t.hand()).toEqual(["BP12-010"]);
    const act = d({ me: { field: ["BP12-017"], ex: [FAIRY, FAIRY, FAIRY] } }).activate("BP12-017");
    expect([act.leader(), act.field(), act.cemetery()]).toEqual([21, [], ["BP12-017"]]);
    expect(d({ me: { field: ["BP12-017"], ex: [FAIRY, FAIRY] } }).canActivate("BP12-017")).toBe(false);
  });

  it("T01 Carbuncle's Sparkle — return a follower, leader +4, or draw 2", () => {
    const ret = d({ me: { ex: [SPARKLE], playPoints: 2 }, opp: { field: ["V5"] } }).play(SPARKLE).choose("return");
    expect([ret.field("opp"), ret.hand("opp")]).toEqual([[], ["V5"]]);
    expect(d({ me: { ex: [SPARKLE], playPoints: 2 } }).play(SPARKLE).choose("defense").leader()).toBe(24);
    expect(d({ me: { ex: [SPARKLE], deck: ["V1", "V3"], playPoints: 2 } }).play(SPARKLE).choose("draw").hand()).toEqual(["V1", "V3"]);
  });
});
