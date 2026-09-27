import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP02 Runecraft (035–051), THE IDOLM@STER CINDERELLA GIRLS. V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral).
// CP02-T01 is a Magical Item (Lesson banishes them from the EX area). BUFF-SOME (0): up to 2 followers of yours +1/+1 this turn.
// iM@S CG followers without abilities besides Evolve: CP02-014 (Cute, 2c), CP02-032 (Cute, 2c), CP02-047 (Passion, 1c).
// CP02-045 is a 1-cost iM@S CG spell (2 damage), CP02-041 a 3-cost one.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ITEM = "CP02-T01";

describe("CP02 Runecraft", () => {
  it("035 Mizuki Kawashima — act, engage: 3 to each enemy leader and follower; 7 with 9 different base costs in your cemetery", () => {
    const costs1to9 = ["V1", "V2", "V3", "CP02-008", "V5", "CP02-050", "CP02-018", "CP02-105", "CP02-031"];
    const t = d({ me: { field: ["CP02-035"], cemetery: costs1to9 }, opp: { field: ["V5"] } }).activate("CP02-035");
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 13]);
    const eight = d({ me: { field: ["CP02-035"], cemetery: [...costs1to9.slice(1), "V2"] }, opp: { field: ["V5"] } }).activate("CP02-035");
    expect([eight.stats("opp:V5"), eight.leader("opp")]).toEqual([[5, 2], 17]);
  });

  it("036 / 037 Shiki Ichinose — Fanfare: one of the top 3 into the EX area; act, engage and discard: 5 damage; evolved: an EX card's cost to your leader, 0 this turn", () => {
    const t = d({ me: { hand: ["CP02-036"], deck: ["V1", "V3", "V5"], playPoints: 5 } }).play("CP02-036").pick("V5");
    expect([t.ex(), t.cemetery()]).toEqual([["V5"], ["V1", "V3"]]);
    const a = d({ me: { field: ["CP02-036"], hand: ["V1"] }, opp: { field: ["V5"] } }).activate("CP02-036");
    expect([a.field("opp"), a.cemetery()]).toEqual([[], ["V1"]]);
    const e = d({ me: { field: ["CP02-036"], evolveDeck: ["CP02-037"], ex: ["V5", "V1"], playPoints: 2 } }).evolve("CP02-036").pick("V5");
    expect([e.leader(), e.pp(), e.canPlay("V5@ex"), e.canPlay("V1@ex")]).toEqual([15, 0, true, false]);
  });

  it("038 Syuko Shiomi — discard 3 iM@S CG cards: 6 less; Fanfare: 4 damage and draw 2", () => {
    const t = d({ me: { hand: ["CP02-038", "CP02-014", "CP02-032", "CP02-047"], deck: ["V1", "V1"], playPoints: 3 }, opp: { field: ["V5"] } });
    t.play("CP02-038");
    expect([t.stats("opp:V5"), t.hand(), t.cemetery().length]).toEqual([[5, 1], ["V1", "V1"], 3]);
    expect(d({ me: { hand: ["CP02-038", "CP02-014", "CP02-032", "V1"], playPoints: 3 } }).canPlay("CP02-038")).toBe(false);
  });

  it("039 / 040 Kanade Hayami — evolved, Lesson (2): 4 damage", () => {
    const t = d({ me: { field: ["CP02-039"], evolveDeck: ["CP02-040"], ex: [ITEM, ITEM], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("CP02-039").yes();
    expect([t.stats("opp:V5"), t.ex()]).toEqual([[5, 1], []]);
  });

  it("041 Center Street — Quick; 5 damage, and draw with a Passion follower on your field", () => {
    const t = d({ me: { hand: ["CP02-041"], field: ["CP02-047"], deck: ["V1"], playPoints: 3 }, opp: { field: ["V5"] } }).play("CP02-041");
    expect([t.field("opp"), t.hand()]).toEqual([[], ["V1"]]);
    expect(d({ me: { hand: ["CP02-041"], field: ["CP02-014"], deck: ["V1"], playPoints: 3 }, opp: { field: ["V5"] } }).play("CP02-041").hand()).toEqual([]);
  });

  it("042 / 043 Hina Araki — evolved: an iM@S CG spell costing 2 or less from your cemetery, played for 0", () => {
    const t = d({ me: { field: ["CP02-042"], evolveDeck: ["CP02-043"], cemetery: ["CP02-045", "V1"], playPoints: 1 }, opp: { field: ["V5"] } });
    t.evolve("CP02-042");
    expect([t.stats("opp:V5"), t.cemetery().sort(), t.pp()]).toEqual([[5, 3], ["CP02-045", "V1"], 0]);
  });

  it("044 Frederica Miyamoto — once per turn, a card that originally costs 5 or more: 3 damage and draw", () => {
    const t = d({ me: { field: ["CP02-044"], hand: ["V5", "V5"], deck: ["V1", "V1"], playPoints: 10 }, opp: { field: ["V3"] } });
    t.play("V5").pick("opp:V3");
    expect([t.stats("opp:V3"), t.hand()]).toEqual([[3, 1], ["V5", "V1"]]);
    t.play("V5");
    expect(t.hand()).toEqual(["V1"]);
  });

  it("045 Precocious Little Devil — Quick; 2 damage, 3 with 3 iM@S CG followers on your field", () => {
    const hit = (field: string[]) => d({ me: { hand: ["CP02-045"], field, playPoints: 1 }, opp: { field: ["V5"] } }).play("CP02-045").stats("opp:V5");
    expect([hit(["CP02-014", "CP02-032", "CP02-047"]), hit(["CP02-014", "CP02-032"])]).toEqual([[5, 2], [5, 3]]);
  });

  it("046 Sarina Matsumoto — whenever you play a spell: 2 damage", () => {
    expect(d({ me: { field: ["CP02-046"], hand: ["BUFF-SOME"] }, opp: { field: ["V5"] } }).play("BUFF-SOME").none().stats("opp:V5")).toEqual([5, 3]);
  });

  it("047 / 048 Rika Jougasaki — evolved: a spell costing 3 or less from the deck", () => {
    const t = d({ me: { field: ["CP02-047"], evolveDeck: ["CP02-048"], deck: ["V1", "CP02-041", "CP02-051"], playPoints: 2 } }).evolve("CP02-047");
    expect(t.decision).toMatchObject({ type: "selectCards", candidateDefs: ["CP02-041"] });
    expect(t.pick("CP02-041").hand()).toEqual(["CP02-041"]);
  });

  it("049 Sae Kobayakawa — Fanfare: +1/+1 to another iM@S CG follower", () => {
    expect(d({ me: { hand: ["CP02-049"], field: ["CP02-014", "V1"], playPoints: 1 } }).play("CP02-049").stats("CP02-014")).toEqual([3, 3]);
  });

  it("050 Tomoe Murakami — discard a card: 2 less; Fanfare: up to 2 spells with different names", () => {
    const t = d({ me: { hand: ["CP02-050", "V1"], deck: ["CP02-041", "CP02-041", "CP02-045", "V3"], playPoints: 4 } }).play("CP02-050").pick("CP02-041");
    expect(t.decision).toMatchObject({ type: "selectCards", candidateDefs: ["CP02-045"] });
    t.pick("CP02-045");
    expect([t.hand().sort(), t.cemetery()]).toEqual([["CP02-041", "CP02-045"], ["V1"]]);
  });

  it("051 Full Bloom Panorama — Quick; destroy up to 2 enemy followers", () => {
    const t = d({ me: { hand: ["CP02-051"], playPoints: 5 }, opp: { field: ["V1", "V3", "V5"] } }).play("CP02-051").pick("opp:V1", "opp:V5");
    expect(t.field("opp")).toEqual(["V3"]);
  });
});
