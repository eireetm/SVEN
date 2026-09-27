import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// ECP02 Runecraft (026–036), THE IDOLM@STER CINDERELLA GIRLS. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP02-T01 is a Magical Item
// (Lesson banishes them from the EX area). iM@S CG followers with only Evolve: CP02-014 Kana Imai / CP02-060 Yuka Nakano (Cute, 2c /
// 1c), CP02-042 Hina Araki / CP02-039 Kanade Hayami (Cool, 2c / 3c), CP02-047 Rika Jougasaki (Passion, 1c). CP02-103 New
// Generations has all three types. CP02-028 Sparkling☆Days is a 1-cost Cool spell.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ITEM = "CP02-T01";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("ECP02 Runecraft", () => {
  it("026 Syuko Shiomi — Fanfare, discard an iM@S CG card: draw; act (2), engage, bury with 10 iM@S CG cards in the cemetery: a Syuko Shiomi", () => {
    expect(d({ me: { hand: ["ECP02-026", "CP02-042"], deck: ["V1"], playPoints: 1 } }).play("ECP02-026").yes().hand()).toEqual(["V1"]);
    const a = d({ me: { field: ["ECP02-026"], deck: ["V1", "ECP02-026"], cemetery: Array<string>(10).fill("CP02-042"), playPoints: 2 } }).activate("ECP02-026").pick("ECP02-026");
    expect([a.field(), a.engaged("ECP02-026"), a.cemetery().length]).toEqual([["ECP02-026"], false, 11]);
  });

  it("027 Mika Jougasaki — Fanfare: an iM@S CG spell into the EX area, 3 less; Lesson (1) with 10 Passion cards: one from the cemetery", () => {
    const t = d({ me: { hand: ["ECP02-027"], deck: ["V1", "CP02-028"], playPoints: 4 } }).play("ECP02-027").pick("CP02-028");
    expect([t.ex(), t.canPlay("CP02-028")]).toEqual([["CP02-028"], true]);
    const a = d({ me: { field: ["ECP02-027"], ex: [ITEM], cemetery: [...Array<string>(10).fill("CP02-047"), "CP02-028"] } }).activate("ECP02-027");
    expect([a.ex(), a.canPlay("CP02-028"), a.canActivate("ECP02-027")]).toEqual([["CP02-028"], true, false]);
  });

  it("028 Yuuki Otokura — Fanfare: -3/-3, -5/-5 with another Cute follower; act (0) with 10 Cute cards: Storm and a Magical Item", () => {
    expect(d({ me: { hand: ["ECP02-028"], playPoints: 3 }, opp: { field: ["V5"] } }).play("ECP02-028").stats("opp:V5")).toEqual([2, 2]);
    expect(d({ me: { hand: ["ECP02-028"], field: ["CP02-014"], playPoints: 3 }, opp: { field: ["V5"] } }).play("ECP02-028").field("opp")).toEqual([]);
    const a = d({ me: { field: ["ECP02-028"], cemetery: Array<string>(10).fill("CP02-014") } }).activate("ECP02-028");
    expect([a.keywords("ECP02-028"), a.ex(), a.canActivate("ECP02-028")]).toEqual([["storm"], [ITEM], false]);
  });

  it("029 Glitz & Glam☆Parade — up to a 2-cost and a 1-cost Passion follower from the cemetery; leader +2", () => {
    const t = d({ me: { hand: ["ECP02-029"], cemetery: ["ECP02-013", "CP02-047"], playPoints: 3 } }).play("ECP02-029").pick("ECP02-013").pick("CP02-047");
    expect([t.field(), t.leader()]).toEqual([["ECP02-013", "CP02-047"], 22]);
  });

  it("030 / 031 Sae Kobayakawa — evolved: 2 damage, 4 with a Cute, Cool and Passion card in the cemetery (one card with all three counts)", () => {
    const all = d({ me: { field: ["ECP02-030"], evolveDeck: ["ECP02-031"], cemetery: ["CP02-103"], playPoints: 1 }, opp: { field: ["V5"] } });
    expect(all.evolve("ECP02-030").stats("opp:V5")).toEqual([5, 1]);
    const two = d({ me: { field: ["ECP02-030"], evolveDeck: ["ECP02-031"], cemetery: ["CP02-014", "CP02-042"], playPoints: 1 }, opp: { field: ["V5"] } });
    expect(two.evolve("ECP02-030").stats("opp:V5")).toEqual([5, 3]);
  });

  it("032 / 033 Hiromi Seki — Fanfare: leader +2 with 5 Cute cards in the cemetery; evolved: a Cute card from the cemetery", () => {
    expect(d({ me: { hand: ["ECP02-032"], cemetery: Array<string>(5).fill("CP02-014"), playPoints: 1 } }).play("ECP02-032").leader()).toBe(22);
    expect(d({ me: { field: ["ECP02-032"], evolveDeck: ["ECP02-033"], cemetery: ["CP02-014", "CP02-042"], playPoints: 1 } }).evolve("ECP02-032").hand()).toEqual(["CP02-014"]);
  });

  it("034 Shiki Ichinose — Fanfare: up to 1 Cute, 1 Cool and 1 Passion card from the top 3 (a card with several types counts as one of them); act, Lesson (2), engage: 4 damage", () => {
    const t = d({ me: { hand: ["ECP02-034"], deck: ["CP02-014", "CP02-060", "CP02-103"], playPoints: 4 } }).play("ECP02-034").pick("CP02-014").pick("CP02-103");
    expect([t.hand().sort(), t.zone("me", "deck")]).toEqual([["CP02-014", "CP02-103"], ["CP02-060"]]);
    const a = d({ me: { field: ["ECP02-034"], ex: [ITEM, ITEM] }, opp: { field: ["V5"] } }).activate("ECP02-034");
    expect([a.stats("opp:V5"), a.engaged("ECP02-034")]).toEqual([[5, 1], true]);
  });

  it("035 Kanade Hayami — Fanfare, Lesson (1): a Shiki Ichinose, Syuko Shiomi, Frederica Miyamoto or Mika Jougasaki from the deck", () => {
    const t = d({ me: { hand: ["ECP02-035"], ex: [ITEM], deck: ["V1", "CP02-044", "ECP02-027"], playPoints: 2 } }).play("ECP02-035").yes().pick("CP02-044");
    expect(t.hand()).toEqual(["CP02-044"]);
  });

  it("036 Tomoe Murakami — Fanfare: the next Passion spell costing 3 or less costs 3 less; once per turn, playing a Passion spell: 2 damage to the enemy leader", () => {
    const t = d({ me: { hand: ["ECP02-036", "ECP02-029", "ECP02-029"], playPoints: 6 } }).play("ECP02-036");
    t.play("ECP02-029");
    expect([t.pp(), t.leader("opp"), t.leader()]).toEqual([3, 18, 22]);
    t.play("ECP02-029");
    expect([t.pp(), t.leader("opp")]).toEqual([0, 18]);
  });
});
