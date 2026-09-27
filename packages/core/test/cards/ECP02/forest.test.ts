import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// ECP02 Forestcraft (001–011), THE IDOLM@STER CINDERELLA GIRLS. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP02-T01 is a Magical Item
// (Lesson banishes them from the EX area). iM@S CG followers with only Evolve: CP02-014 Kana Imai / CP02-060 Yuka Nakano (Cute, 2c /
// 1c), CP02-042 Hina Araki / CP02-039 Kanade Hayami (Cool, 2c / 3c), CP02-047 Rika Jougasaki (Passion, 1c). CP02-103 New
// Generations has all three types. CP02-028 Sparkling☆Days is a 1-cost Cool spell.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ITEM = "CP02-T01";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("ECP02 Forestcraft", () => {
  it("001 Anastasia [Seize the Light] — Fanfare (1), Lesson (1): an iM@S CG follower costing 2 or less from the hand into the EX area, 2 less", () => {
    const t = d({ me: { hand: ["ECP02-001", "CP02-014"], ex: [ITEM], playPoints: 3 } }).play("ECP02-001").yes().pick("CP02-014");
    expect([t.ex(), t.canPlay("CP02-014"), t.pp()]).toEqual([["CP02-014"], true, 0]);
  });

  it("002 Anastasia [Seize the Light] (Evolved) — On Evolve: up to 2 other iM@S CG followers +1/+1; On Super-Evolve: each other one +1/+1", () => {
    const e = d({ me: { field: ["ECP02-001", "CP02-014", "CP02-042", "V1"], evolveDeck: ["ECP02-002"], playPoints: 1 } });
    e.evolve("ECP02-001").pick("CP02-014", "CP02-042");
    expect([e.stats("CP02-014"), e.stats("CP02-042"), e.stats("V1")]).toEqual([[3, 3], [3, 3], [2, 2]]);
    const s = d({ me: { field: ["ECP02-001", "CP02-014", "CP02-042"], evolveDeck: ["ECP02-002"], playPoints: 1, ...SUPER } });
    s.evolve("ECP02-001", { sep: true }).pending().pick("CP02-014", "CP02-042");
    expect([s.stats("CP02-014"), s.stats("CP02-042")]).toEqual([[4, 4], [4, 4]]);
  });

  it("003 Hajime Fujiwara — Fanfare: may take the top card if Cool; act (0) with 3 Cool followers, once per turn: 1 damage", () => {
    expect(d({ me: { hand: ["ECP02-003"], deck: ["CP02-042"], playPoints: 2 } }).play("ECP02-003").pick("CP02-042").hand()).toEqual(["CP02-042"]);
    const a = d({ me: { field: ["ECP02-003", "CP02-042", "CP02-039"] }, opp: { field: ["V1"] } }).activate("ECP02-003");
    expect([a.stats("opp:V1"), a.canActivate("ECP02-003")]).toEqual([[2, 1], false]);
    expect(d({ me: { field: ["ECP02-003", "CP02-042"] }, opp: { field: ["V1"] } }).canActivate("ECP02-003")).toBe(false);
  });

  it("004 Minami Nitta — Fanfare: an Anastasia into the EX area, 3 less; act, Lesson (1), engage: engage an enemy follower, it doesn't refresh next", () => {
    const t = d({ me: { hand: ["ECP02-004"], deck: ["V1", "ECP02-001"], playPoints: 3 } }).play("ECP02-004").pick("ECP02-001");
    expect([t.ex(), t.canPlay("ECP02-001")]).toEqual([["ECP02-001"], true]);
    const a = d({ me: { field: ["ECP02-004"], ex: [ITEM] }, opp: { field: ["V5"], deck: ["V1"] } }).activate("ECP02-004");
    expect([a.engaged("opp:V5"), a.engaged("ECP02-004"), a.ex()]).toEqual([true, true, []]);
    expect(a.end().engaged("opp:V5")).toBe(true);
  });

  it("005 Yuki Himekawa — Storm; Fanfare: 4 damage to each enemy follower, 8 with 10+ total Passion cost, and 4 to the leader with 20+", () => {
    const t = d({ me: { hand: ["ECP02-005"], field: ["CP02-047"], playPoints: 7 }, opp: { field: ["V5", "V3"] } }).play("ECP02-005");
    expect([t.stats("opp:V5"), t.field("opp"), t.leader("opp")]).toEqual([[5, 1], ["V5"], 20]);
    // 8 + 6 + 7: 8 damage and 4 to the leader (and 1 more from Takumi Mukai, ECP02-057).
    const b = d({ me: { hand: ["ECP02-005"], field: ["ECP02-041", "ECP02-057"], playPoints: 7 }, opp: { field: ["V5"] } }).play("ECP02-005");
    expect([b.field("opp"), b.leader("opp")]).toEqual([[], 15]);
  });

  it("006 / 007 Riina Tada — Fanfare: a 1-cost iM@S CG amulet onto the field; Lesson (1): a 1-cost one from the hand; evolved: return one: bottom an enemy", () => {
    expect(d({ me: { hand: ["ECP02-006"], deck: ["V1", "ECP02-025"], playPoints: 5 } }).play("ECP02-006").pick("ECP02-025").field()).toEqual(["ECP02-006", "ECP02-025"]);
    expect(d({ me: { field: ["ECP02-006"], hand: ["CP02-047"], ex: [ITEM] } }).activate("ECP02-006").pick("CP02-047").field()).toEqual(["ECP02-006", "CP02-047"]);
    const e = d({ me: { field: ["ECP02-006", "CP02-047"], evolveDeck: ["ECP02-007"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("ECP02-006").yes().pick("CP02-047");
    expect([e.hand(), e.field("opp"), e.zone("opp", "deck")]).toEqual([["CP02-047"], [], ["V5"]]);
  });

  it("008 / 009 Hinako Kita — Fanfare, Lesson (1): leader +1; evolved: draw, leader +2", () => {
    expect(d({ me: { hand: ["ECP02-008"], ex: [ITEM], playPoints: 1 } }).play("ECP02-008").yes().leader()).toBe(21);
    const e = d({ me: { field: ["ECP02-008"], evolveDeck: ["ECP02-009"], deck: ["V1"], playPoints: 2 } }).evolve("ECP02-008");
    expect([e.leader(), e.hand()]).toEqual([22, ["V1"]]);
  });

  it("010 Miku Maekawa [Meownderful World] — Storm; Last Words, Lesson (1): a Miku Maekawa from the deck", () => {
    const t = d({ me: { field: ["ECP02-010"], hand: ["QUICK-SAC"], ex: [ITEM], deck: ["V1", "CP02-003"] } }).play("QUICK-SAC").yes().pick("CP02-003");
    expect([t.hand(), t.ex()]).toEqual([["CP02-003"], []]);
  });

  it("011 Blossoms' Advance — may summon a Passion follower costing 6 or less from the hand; a Magical Item into the EX area", () => {
    const t = d({ me: { hand: ["ECP02-011", "CP02-047"], playPoints: 5 } }).play("ECP02-011").pick("CP02-047");
    expect([t.field(), t.ex()]).toEqual([["CP02-047"], [ITEM]]);
  });
});
