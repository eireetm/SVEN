import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP07 Forestcraft (001–017). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5; QUICK-SAC destroys a follower of
// yours (0). Tokens: BP07-T03 Naterran Great Tree (amulet), BP01-T03 Fairy, BP01-T02 Fairy Wisp.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const TREE = "BP07-T03";

describe("BP07 Forestcraft", () => {
  it("001 / 002 Ladica — evolves only after 5 cards played this turn; each recovers 1 PP when a Tree is put onto your field", () => {
    expect(d({ me: { field: ["BP07-001"], evolveDeck: ["BP07-002"], playPoints: 1 } }).canEvolve("BP07-001")).toBe(false);
    const five = d({ me: { field: ["BP07-001"], evolveDeck: ["BP07-002"], playPoints: 1, playedThisTurn: 5 } }).evolve("BP07-001");
    expect(five.keywords("BP07-001")).toEqual(["storm"]);
    // Two Ladicas both trigger (ruling); a Tree into the EX area is not put onto the field.
    const t = d({ me: { field: ["BP07-001", { card: "BP07-001", evolvedInto: "BP07-002" }], hand: ["BP07-033"], playPoints: 1 } });
    t.play("BP07-033").flush();
    expect([t.field(), t.ex(), t.pp()]).toEqual([["BP07-001", "BP07-001", TREE], [TREE], 2]);
  });

  it("003 Cynthia — a Fairy Wisp into the EX area and +2 to Pixie tokens (EX full too); they have Storm and Assail; new ones get +2", () => {
    const t = d({ me: { hand: ["BP07-003"], field: ["BP01-T03"], ex: ["V1", "V1", "V1", "V1", "V1"], playPoints: 6 } }).play("BP07-003");
    expect([t.ex().length, t.stats("BP01-T03"), t.keywords("BP01-T03")]).toEqual([5, [3, 1], ["storm", "assail"]]);
    const wisp = d({ me: { field: ["BP07-003"], ex: ["BP01-T02"] } }).play("BP01-T02");
    expect([wisp.stats("BP01-T02"), wisp.attackTargets("BP01-T02")]).toEqual([[3, 1], ["opp:leader"]]);
  });

  it("004 Primal Giant — discarded: a Tree into the EX area; bury 4 Natura cards to cost 4 less; summons a Forestcraft follower costing 5 or less", () => {
    const discarded = d({ me: { hand: ["BP07-078", "BP07-004"], deck: ["V1"] } }).play("BP07-078").yes();
    expect([discarded.ex(), discarded.cemetery()]).toEqual([["V1", TREE], ["BP07-004"]]);
    const t = d({ me: { hand: ["BP07-004"], field: ["BP07-010", "BP07-010", "BP07-010", "BP07-010", "V1"], cemetery: ["BP07-014", "V5"], playPoints: 5 } });
    t.play("BP07-004").pick("BP07-014"); // the buried Avatars are Forestcraft followers too
    expect([t.field(), t.pp()]).toEqual([["V1", "BP07-004", "BP07-014"], 0]);
    // Buried Trees' abilities and the Fanfare resolve in any order: a Tree first discards a
    // Forestcraft follower that the Fanfare then summons (ruling).
    const trees = d({ me: { hand: ["BP07-004"], field: [TREE, TREE, TREE, TREE], deck: ["BP07-014", "V1", "V1", "V1"], playPoints: 5 } });
    trees.play("BP07-004").pending(TREE).pending("BP07-004").flush();
    expect([trees.field(), trees.cemetery(), trees.ex()]).toEqual([["BP07-004", "BP07-014"], ["V1", "V1", "V1"], [TREE]]);
  });

  it("005 / 006 Setus — end phase: leader +4, and +2/+2 if a follower (a token too) went from your field to the cemetery; evolved summons a follower costing 3 or less", () => {
    const quiet = d({ me: { field: ["BP07-005"] }, opp: { deck: ["V1"] } }).end().none();
    expect([quiet.leader(), quiet.stats("BP07-005")]).toEqual([24, [3, 5]]);
    const t = d({ me: { field: ["BP07-005", "BP01-T03"], hand: ["QUICK-SAC"] }, opp: { deck: ["V1"] } }).play("QUICK-SAC").pick("BP01-T03");
    t.end().none();
    expect([t.leader(), t.stats("BP07-005")]).toEqual([24, [5, 7]]);
    const evo = d({ me: { field: ["BP07-005"], evolveDeck: ["BP07-006"], cemetery: ["V3", "V5"], playPoints: 2 } }).evolve("BP07-005");
    expect(evo.field()).toEqual(["BP07-005", "V3"]);
  });

  it("007 Send 'Em Packing — Ladica +1/+1; Combo (5): its attack as damage to each enemy follower", () => {
    const t = d({ me: { hand: ["BP07-007"], field: ["BP07-001"] }, opp: { field: ["V5", "V1"] } }).play("BP07-007");
    expect([t.stats("BP07-001"), t.field("opp")]).toEqual([[6, 6], ["V5", "V1"]]);
    const combo = d({ me: { hand: ["BP07-007"], field: ["BP07-001"], playedThisTurn: 4 }, opp: { field: ["V5", "V1"] } }).play("BP07-007");
    expect(combo.field("opp")).toEqual([]);
    expect(d({ me: { hand: ["BP07-007"] }, opp: { field: ["V5"] } }).canPlay("BP07-007")).toBe(false);
  });

  it("008 / 009 Blossom Spirit — a Tree or a Fairy into the EX area; evolved: 2 damage, 4 with 3 cards in your EX area", () => {
    expect(d({ me: { hand: ["BP07-008"] } }).play("BP07-008").choose("fairy").ex()).toEqual(["BP01-T03"]);
    const two = d({ me: { field: ["BP07-008"], evolveDeck: ["BP07-009"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP07-008");
    expect(two.stats("opp:V5")).toEqual([5, 3]);
    const four = d({ me: { field: ["BP07-008"], evolveDeck: ["BP07-009"], ex: ["V1", "V1", "V1"], playPoints: 1 }, opp: { field: ["V5"] } });
    expect(four.evolve("BP07-008").stats("opp:V5")).toEqual([5, 1]);
  });

  it("010 Avatar of Fruition — a Tree into the EX area; your Trees cost 1 less", () => {
    const t = d({ me: { hand: ["BP07-010"], playPoints: 2 } }).play("BP07-010");
    expect([t.ex(), t.pp(), t.canPlay(TREE)]).toEqual([[TREE], 0, true]);
    t.play(TREE);
    expect(t.field()).toEqual(["BP07-010", TREE]);
  });

  it("011 Divine Smithing — up to 2 Pixie followers on your field or in your EX area +1/+0 (kept when played from the EX area); Combo (3): draw", () => {
    const t = d({ me: { hand: ["BP07-011"], field: ["BP01-T03"], ex: ["BP01-T02"], deck: ["V1"] } }).play("BP07-011").pick("BP01-T03", "BP01-T02");
    expect([t.stats("BP01-T03"), t.hand()]).toEqual([[2, 1], []]);
    t.play("BP01-T02");
    expect(t.stats("BP01-T02")).toEqual([2, 1]);
    const combo = d({ me: { hand: ["BP07-011"], deck: ["V1"], playedThisTurn: 2 } }).play("BP07-011");
    expect(combo.hand()).toEqual(["V1"]);
  });

  it("012 Cheshire Cat — 1 damage, 2 if not from the hand; act: to the deck bottom for 2 Fable counters (itself: none)", () => {
    expect(d({ me: { hand: ["BP07-012"] }, opp: { field: ["V5"] } }).play("BP07-012").pick("opp:V5").stats("opp:V5")).toEqual([5, 4]);
    expect(d({ me: { ex: ["BP07-012"] }, opp: { field: ["V5"] } }).play("BP07-012").pick("opp:leader").leader("opp")).toBe(18);
    const self = d({ me: { field: ["BP07-012"], deck: ["V1"] } }).activate("BP07-012");
    expect([self.field(), self.zone("me", "deck")]).toEqual([[], ["V1", "BP07-012"]]);
    const other = d({ me: { field: ["BP07-012"], ex: ["BP07-016"] } }).activate("BP07-012").pick("BP07-016");
    expect(other.counters("BP07-016", "fable")).toBe(2);
  });

  it("013 Ghastly Treant — a Tree into the EX area; once per turn, banish a Tree on your field: leader +3", () => {
    expect(d({ me: { hand: ["BP07-013"] } }).play("BP07-013").ex()).toEqual([TREE]);
    const t = d({ me: { field: ["BP07-013", TREE, TREE], deck: ["V1"] } }).activate("BP07-013").pick(TREE);
    expect([t.leader(), t.field(), t.cemetery()]).toEqual([23, ["BP07-013", TREE], ["V1"]]); // the Tree drew and discarded V1
    expect(t.canActivate("BP07-013")).toBe(false);
  });

  it("014 / 015 Forest Hermit — a Tree into the EX area; evolved: a Natura card from the cemetery to the hand", () => {
    expect(d({ me: { hand: ["BP07-014"] } }).play("BP07-014").ex()).toEqual([TREE]);
    const evo = d({ me: { field: ["BP07-014"], evolveDeck: ["BP07-015"], cemetery: ["BP07-010", "V1"], playPoints: 1 } }).evolve("BP07-014");
    expect(evo.hand()).toEqual(["BP07-010"]);
  });

  it("016 Marvelously Mad Matter — with another Fable card: a Fable follower from the deck into the EX area, may get a Fable counter", () => {
    const t = d({ me: { hand: ["BP07-016"], field: ["BP07-012"], deck: ["V1", "BP07-093"], playPoints: 4 } }).play("BP07-016").pick("BP07-093").yes();
    expect([t.ex(), t.counters("BP07-093", "fable")]).toEqual([["BP07-093"], 1]);
    // A card played from the EX area keeps its counters (BP03-102 ruling).
    t.play("BP07-093");
    expect(t.counters("BP07-093@field", "fable")).toBe(1);
    expect(d({ me: { hand: ["BP07-016"], deck: ["BP07-093"] } }).play("BP07-016").ex()).toEqual([]);
  });

  it("017 Fertile Aether — a Tree into the EX area; Combo (3): 2 Trees and leader +2", () => {
    expect(d({ me: { hand: ["BP07-017"] } }).play("BP07-017").ex()).toEqual([TREE]);
    const combo = d({ me: { hand: ["BP07-017"], playedThisTurn: 2 } }).play("BP07-017");
    expect([combo.ex(), combo.leader()]).toEqual([[TREE, TREE], 22]);
  });
});
