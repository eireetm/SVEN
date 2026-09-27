import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP02 Abysscraft (069–085), THE IDOLM@STER CINDERELLA GIRLS. V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral).
// CP02-T01 is a Magical Item (Lesson banishes them from the EX area). QUICK-SAC (0) destroys a follower of yours. iM@S CG
// followers without abilities besides Evolve: CP02-014 (Cute, 2c), CP02-032 (Cute, 2c), CP02-047 (Passion, 1c). CP02-045 is a
// 1-cost iM@S CG spell. CP02-076 (3c) deals 2 damage to your leader: playing it first makes Sanguine active.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const ITEM = "CP02-T01";

describe("CP02 Abysscraft", () => {
  it("069 / 070 Ranko Kanzaki — Fanfare: 2 damage; act (1), Lesson (2): 2 to up to 2 enemy followers; evolved: one of the top 4 into the EX area", () => {
    expect(d({ me: { hand: ["CP02-069"], playPoints: 4 }, opp: { field: ["V5"] } }).play("CP02-069").stats("opp:V5")).toEqual([5, 3]);
    const a = d({ me: { field: ["CP02-069"], ex: [ITEM, ITEM], playPoints: 1 }, opp: { field: ["V5", "V3"] } }).activate("CP02-069").pick("opp:V5", "opp:V3");
    expect([a.stats("opp:V5"), a.stats("opp:V3"), a.ex()]).toEqual([[5, 3], [3, 2], []]);
    const e = d({ me: { field: ["CP02-069"], evolveDeck: ["CP02-070"], deck: ["V1", "V2", "V3", "V5"], playPoints: 1 } }).evolve("CP02-069").pick("V5");
    expect([e.ex(), e.cemetery()]).toEqual([["V5"], ["V1", "V2", "V3"]]);
  });

  it("071 Sachiko Koshimizu — Fanfare: 2 to your leader; Storm and Bane while your leader has 10 defense or less", () => {
    const t = d({ me: { hand: ["CP02-071"], leaderDefense: 12, playPoints: 2 } }).play("CP02-071");
    expect([t.leader(), t.keywords("CP02-071")]).toEqual([10, ["storm", "bane"]]);
    expect(d({ me: { hand: ["CP02-071"], leaderDefense: 13, playPoints: 2 } }).play("CP02-071").keywords("CP02-071")).toEqual([]);
  });

  it("072 / 073 Takumi Mukai — evolved: destroy an enemy follower and 3 to your leader", () => {
    const e = d({ me: { field: ["CP02-072"], evolveDeck: ["CP02-073"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("CP02-072");
    expect([e.field("opp"), e.leader()]).toEqual([[], 17]);
    expect(d({ me: { field: ["CP02-072"], evolveDeck: ["CP02-073"], playPoints: 1 } }).evolve("CP02-072").leader()).toBe(20);
  });

  it("074 Chitose Kurosaki — during your turn your leader and other followers take no ability damage; act (1), Lesson (1): 3 damage, once per turn", () => {
    expect(d({ me: { field: ["CP02-074"], hand: ["CP02-076"], deck: ["V1", "V1"], playPoints: 3 } }).play("CP02-076").leader()).toBe(20);
    const t = d({ me: { field: ["CP02-074", "V5"], hand: ["CP02-062"], playPoints: 5 }, opp: { field: ["V1"] } }).play("CP02-062");
    expect([t.field(), t.stats("V5"), t.field("opp")]).toEqual([["V5"], [5, 5], []]);
    const a = d({ me: { field: ["CP02-074"], ex: [ITEM, ITEM], playPoints: 2 }, opp: { field: ["V5"] } }).activate("CP02-074");
    expect([a.stats("opp:V5"), a.canActivate("CP02-074")]).toEqual([[5, 2], false]);
  });

  it("075 Whispers of a Dream — Quick; destroy an enemy follower costing 3 or less, bury your top card", () => {
    const t = d({ me: { hand: ["CP02-075"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V3", "V5"] } }).play("CP02-075");
    expect([t.field("opp"), t.cemetery().sort()]).toEqual([["V5"], ["CP02-075", "V1"]]);
  });

  it("076 Chiyo Shirayuki — Fanfare: 2 to your leader, draw 2", () => {
    const t = d({ me: { hand: ["CP02-076"], deck: ["V1", "V1"], playPoints: 3 } }).play("CP02-076");
    expect([t.leader(), t.hand()]).toEqual([18, ["V1", "V1"]]);
  });

  it("077 / 078 Aki Yamato — Fanfare: 5 damage; evolved: 5 to up to 2 enemy followers", () => {
    expect(d({ me: { hand: ["CP02-077"], playPoints: 7 }, opp: { field: ["V5"] } }).play("CP02-077").field("opp")).toEqual([]);
    const e = d({ me: { field: ["CP02-077"], evolveDeck: ["CP02-078"], playPoints: 1 }, opp: { field: ["V5", "V3", "V1"] } }).evolve("CP02-077").pick("opp:V5", "opp:V3");
    expect(e.field("opp")).toEqual(["V1"]);
  });

  it("079 My Life, My Sounds — destroy; 2 to its leader with Sanguine", () => {
    const t = d({ me: { hand: ["CP02-076", "CP02-079"], deck: ["V1", "V1"], playPoints: 6 }, opp: { field: ["V5"] } }).play("CP02-076").play("CP02-079");
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 18]);
    expect(d({ me: { hand: ["CP02-079"], playPoints: 3 }, opp: { field: ["V5"] } }).play("CP02-079").leader("opp")).toBe(20);
  });

  it("080 Ryo Matsunaga — Ward; Last Words: an iM@S CG spell from your cemetery", () => {
    const t = d({ me: { field: ["CP02-080"], hand: ["QUICK-SAC"], cemetery: ["CP02-045", "V1"] } }).play("QUICK-SAC");
    expect([t.hand(), t.keywords("CP02-080@cemetery")]).toEqual([["CP02-045"], ["ward"]]);
  });

  it("081 Mirei Hayasaka — Fanfare: keep one of the top 3 on top, bury the rest; Rush with 5 iM@S CG cards in your cemetery", () => {
    const t = d({ me: { hand: ["CP02-081"], deck: ["CP02-032", "CP02-047", "V1", "V2"], cemetery: n(4, "CP02-014"), playPoints: 3 } });
    expect(t.play("CP02-081").keywords("CP02-081")).toEqual([]);
    t.pick("V1");
    expect([t.zone("me", "deck"), t.keywords("CP02-081")]).toEqual([["V1", "V2"], ["rush"]]);
  });

  it("082 Rina Fujimoto — 1 less after an evolution this turn; Fanfare with Sanguine: 3 damage", () => {
    expect(d({ me: { hand: ["CP02-082"], evolvedThisTurn: 1, playPoints: 1 } }).canPlay("CP02-082")).toBe(true);
    expect(d({ me: { hand: ["CP02-082"], playPoints: 1 } }).canPlay("CP02-082")).toBe(false);
    const t = d({ me: { hand: ["CP02-076", "CP02-082"], deck: ["V1", "V1"], playPoints: 5 }, opp: { field: ["V5"] } }).play("CP02-076").play("CP02-082");
    expect(t.stats("opp:V5")).toEqual([5, 2]);
  });

  it("083 / 084 Syoko Hoshi — can't attack enemies; end phase: leader +1; evolved: end phase and Last Words, 1 to the enemy leader", () => {
    const t = d({ me: { field: ["CP02-083"] }, opp: { deck: ["V1"] } });
    expect(t.attackTargets("CP02-083")).toEqual([]);
    expect(t.end().leader()).toBe(21);
    const e = d({ me: { field: ["CP02-083"], evolveDeck: ["CP02-084"], hand: ["QUICK-SAC"], playPoints: 1 }, opp: { deck: ["V1"] } }).evolve("CP02-083");
    expect(e.attackTargets("CP02-083")).toEqual(["opp:leader"]);
    expect(e.play("QUICK-SAC").leader("opp")).toBe(19);
    expect(d({ me: { field: ["CP02-083"], evolveDeck: ["CP02-084"], playPoints: 1 }, opp: { deck: ["V1"] } }).evolve("CP02-083").end().leader("opp")).toBe(19);
  });

  it("085 Last Daylight — 3 damage and +1/+0 to your followers costing 1 or less", () => {
    const t = d({ me: { hand: ["CP02-085"], field: ["V1", "V2", "CP02-047"], playPoints: 2 }, opp: { field: ["V5"] } }).play("CP02-085");
    expect([t.stats("opp:V5"), t.stats("V1"), t.stats("CP02-047"), t.stats("V2")]).toEqual([[5, 2], [3, 2], [2, 1], [2, 3]]);
  });
});
