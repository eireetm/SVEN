import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP09 Forestcraft (001–017). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5. Forestcraft spells with different
// names: BP01-015 Nature's Guidance, BP01-023 Fairy Circle (1, 3 Fairies into the EX area), BP01-024
// Woodkin Curse (2), BP02-011 Elven Archery, BP03-016 Floral Breeze; BP01-008 Homecoming costs 3.
// Tokens: BP01-T03 Fairy, BP01-T02 Fairy Wisp, BP01-T16 Holy Falcon, BP05-T03 Puppet.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const FOUR_NAMES = ["BP01-015", "BP01-023", "BP01-024", "BP02-011"];
const FIVE_NAMES = [...FOUR_NAMES, "BP03-016"];
const FAIRY = "BP01-T03";

describe("BP09 Forestcraft", () => {
  it("001 Yggdrasil — Fanfare searches a Forestcraft spell; act: a Forestcraft spell costing up to X (names in the cemetery) into the EX area, free this turn", () => {
    const fan = d({ me: { hand: ["BP09-001"], deck: ["V1", "BP01-023"], playPoints: 5 } }).play("BP09-001").pick("BP01-023");
    expect(fan.hand()).toEqual(["BP01-023"]);
    // 2 names (Homecoming, Fairy Circle): X = 2, so Homecoming (3) can't be selected.
    const two = d({ me: { field: ["BP09-001"], cemetery: ["BP01-008", "BP01-023"], playPoints: 1 } }).activate("BP09-001");
    expect([two.ex(), two.cemetery()]).toEqual([["BP01-023"], ["BP01-008"]]);
    two.play("BP01-023");
    expect([two.pp(), two.ex(), two.canActivate("BP09-001")]).toEqual([0, [FAIRY, FAIRY, FAIRY], false]);
    const three = d({ me: { field: ["BP09-001"], cemetery: ["BP01-008", "BP01-023", "BP01-015"], playPoints: 1 } }).activate("BP09-001").pick("BP01-008");
    expect(three.ex()).toEqual(["BP01-008"]);
  });

  it("002 White Vanara — another follower put onto your field: +1/+1, a Beast +2/+2", () => {
    const t = d({ me: { field: ["BP09-002"], hand: ["V1", "BP09-010"] } }).play("V1");
    expect(t.stats("BP09-002")).toEqual([3, 3]);
    t.play("BP09-010").flush(); // +2/+2 for the Beast Owl Man, and its Fanfare's +1/+1
    expect(t.stats("BP09-002")).toEqual([6, 6]);
  });

  it("003 White Vanara (Evolved) — Strike: damage equal to its attack to an enemy follower", () => {
    const t = d({ me: { field: [{ card: "BP09-002", evolvedInto: "BP09-003" }] }, opp: { field: [{ card: "V1", engaged: true }, "V5"] } });
    t.attack("BP09-002", "opp:V1").pick("opp:V5");
    expect([t.field("opp"), t.stats("opp:V5"), t.stats("BP09-002")]).toEqual([["V5"], [5, 2], [3, 1]]);
  });

  it("004 / 005 Paula — evolves into either face; Gentle Warmth: a Forestcraft spell from the top 5", () => {
    const t = d({ me: { field: ["BP09-004"], evolveDeck: ["BP09-005"], deck: ["V1", "BP01-023", "V3"] } });
    t.evolve("BP09-004", { into: "BP09-005" }).pick("BP01-023").order();
    expect([t.hand(), t.zone("me", "deck").sort()]).toEqual([["BP01-023"], ["V1", "V3"]]);
  });

  it("005_back Paula, Passionate Warmth — up to 2 other cards into the EX area (room for one: pick which); Strike, Combo (3): 3 damage", () => {
    const ex = ["V1", "V1", "V1", "V1"];
    const t = d({ me: { field: ["BP09-004", "V3", FAIRY], evolveDeck: ["BP09-005"], ex } });
    t.evolve("BP09-004", { into: "BP09-005_back" }).pick("V3", FAIRY).pick(FAIRY);
    expect([t.field(), t.ex()]).toEqual([["BP09-004", "V3"], [...ex, FAIRY]]);
    const paula = { card: "BP09-004", evolvedInto: "BP09-005_back" };
    const combo = d({ me: { field: [paula], playedThisTurn: 3 }, opp: { field: ["V3"] } }).attack("BP09-004", "opp:leader");
    expect(combo.stats("opp:V3")).toEqual([3, 1]);
    // Evolving is not playing a card (ruling).
    const two = d({ me: { field: [paula], playedThisTurn: 2 }, opp: { field: ["V3"] } }).attack("BP09-004", "opp:leader");
    expect(two.stats("opp:V3")).toEqual([3, 4]);
  });

  it("006 Greenglen Axeman — discarding a Forestcraft spell on your turn draws; act: 4 damage or 2 to each enemy leader", () => {
    const t = d({ me: { field: ["BP09-006"], hand: ["BP01-023"], deck: ["V1"] } }).activate("BP09-006");
    expect([t.hand(), t.leader("opp"), t.cemetery()]).toEqual([["V1"], 18, ["BP01-023"]]);
    const other = d({ me: { field: ["BP09-006"], hand: ["V3"], deck: ["V1"] }, opp: { field: ["V5"] } }).activate("BP09-006").choose("follower");
    expect([other.hand(), other.stats("opp:V5")]).toEqual([[], [5, 1]]);
  });

  it("007 Wrath of Nature — 3 damage to each enemy follower; with 5 Forestcraft spell names: 5, and 2 to each enemy leader", () => {
    const four = d({ me: { hand: ["BP09-007"], cemetery: FOUR_NAMES, playPoints: 4 }, opp: { field: ["V3", "V5"] } }).play("BP09-007");
    expect([four.field("opp"), four.stats("opp:V5"), four.leader("opp")]).toEqual([["V3", "V5"], [5, 2], 20]);
    const five = d({ me: { hand: ["BP09-007"], cemetery: FIVE_NAMES, playPoints: 4 }, opp: { field: ["V3", "V5"] } }).play("BP09-007");
    expect([five.field("opp"), five.leader("opp")]).toEqual([[], 18]);
  });

  it("008 / 009 Storied Falconer — a Holy Falcon; evolved: the Falcon gets +1 attack and Bane", () => {
    const t = d({ me: { hand: ["BP09-008"], evolveDeck: ["BP09-009"], playPoints: 5 } }).play("BP09-008").evolve("BP09-008");
    expect([t.stats("BP01-T16"), t.keywords("BP01-T16")]).toEqual([[3, 2], ["storm", "bane"]]);
  });

  it("010 Owl Man — another Beast follower on your field gets +1/+1", () => {
    const t = d({ me: { hand: ["BP09-010"], field: ["BP09-008", "V1"] } }).play("BP09-010");
    expect([t.stats("BP09-008"), t.stats("V1")]).toEqual([[4, 4], [2, 2]]);
  });

  it("011 Blessings of Creation — draw; with 5 Forestcraft spell names your leader gets +2", () => {
    const t = d({ me: { hand: ["BP09-011"], cemetery: FIVE_NAMES, deck: ["V1"] } }).play("BP09-011");
    expect([t.hand(), t.leader()]).toEqual([["V1"], 22]);
    const four = d({ me: { hand: ["BP09-011"], cemetery: FOUR_NAMES, deck: ["V1"] } }).play("BP09-011");
    expect(four.leader()).toBe(20);
  });

  it("012 / 013 Grasshopper Conductor — with 5 names: 4 damage; evolved searches a Forestcraft spell costing 1 or less", () => {
    const t = d({ me: { hand: ["BP09-012"], cemetery: FIVE_NAMES }, opp: { field: ["V5"] } }).play("BP09-012");
    expect(t.stats("opp:V5")).toEqual([5, 1]);
    const none = d({ me: { hand: ["BP09-012"], cemetery: FOUR_NAMES }, opp: { field: ["V5"] } }).play("BP09-012");
    expect(none.stats("opp:V5")).toEqual([5, 5]);
    const evo = d({ me: { field: ["BP09-012"], evolveDeck: ["BP09-013"], deck: ["BP01-024", "BP01-023"] } }).evolve("BP09-012").pick("BP01-023");
    expect(evo.hand()).toEqual(["BP01-023"]);
  });

  it("014 Elf General — Ward; 2 Fairies with +1/+1 and Ward", () => {
    const t = d({ me: { hand: ["BP09-014"], playPoints: 5 } }).play("BP09-014").none();
    expect([t.field(), t.stats(FAIRY), t.keywords(FAIRY)]).toEqual([["BP09-014", FAIRY, FAIRY], [2, 2], ["ward"]]);
  });

  it("015 Lila — discard a card: leader +1, and a draw if it was a Forestcraft spell", () => {
    const spell = d({ me: { hand: ["BP09-015", "BP01-023"], deck: ["V1"] } }).play("BP09-015").yes();
    expect([spell.leader(), spell.hand(), spell.cemetery()]).toEqual([21, ["V1"], ["BP01-023"]]);
    const other = d({ me: { hand: ["BP09-015", "V3"], deck: ["V1"] } }).play("BP09-015").yes();
    expect([other.leader(), other.hand()]).toEqual([21, []]);
  });

  it("016 Substitution — an enemy follower costing 3 or less back to hand, a Puppet into your EX area; needs a target", () => {
    const t = d({ me: { hand: ["BP09-016"] }, opp: { field: ["V3", "V5"] } }).play("BP09-016");
    expect([t.field("opp"), t.hand("opp"), t.ex()]).toEqual([["V5"], ["V3"], ["BP05-T03"]]);
    expect(d({ me: { hand: ["BP09-016"] }, opp: { field: ["V5"] } }).canPlay("BP09-016")).toBe(false);
  });

  it("017 Flower of Fairies — a Fairy Wisp into the EX area; act: engage and bury it for a Fairy", () => {
    const t = d({ me: { hand: ["BP09-017"] } }).play("BP09-017");
    expect(t.ex()).toEqual(["BP01-T02"]);
    t.activate("BP09-017");
    expect([t.field(), t.cemetery()]).toEqual([[FAIRY], ["BP09-017"]]);
  });
});
