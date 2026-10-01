import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP22 Abysscraft (074–091). Pre-release cards with Japanese names (data/preview.ts). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c
// 5/5 (Neutral); QUICK-SAC (0) destroys one of your followers. BP01-171 Goblin (1c Goblin), BP01-117 Skeleton Fighter (1c Departed),
// BP22-080 ゾンビドッグ / 088 よろめく不死者 (2c Abysscraft Departed followers).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);

describe("BP22 Abysscraft", () => {
  it("074 スケルトンレイダー — can't attack with 9 or fewer 2-cost cards in the cemetery; Fanfare: per 10 of them, choose up to 1 of destroy + 1 to each enemy / Storm", () => {
    expect(d({ me: { field: ["BP22-074"], cemetery: n(9, "V2") } }).attackTargets("BP22-074")).toEqual([]);
    expect(d({ me: { field: ["BP22-074"], cemetery: n(10, "V2") } }).attackTargets("BP22-074")).toEqual(["opp:leader"]);
    const t = d({ me: { hand: ["BP22-074"], cemetery: n(10, "V2"), playPoints: 2 }, opp: { field: ["V5", "V3"] } }).play("BP22-074").choose("destroy").pick("opp:V5");
    expect([t.field("opp"), t.stats("opp:V3"), t.leader("opp"), t.keywords("BP22-074")]).toEqual([["V3"], [3, 3], 19, []]);
    const two = d({ me: { hand: ["BP22-074"], cemetery: n(20, "V2"), playPoints: 2 }, opp: { field: ["V5", "V3"] } }).play("BP22-074").choose("destroy", "storm").pick("opp:V5");
    expect([two.field("opp"), two.keywords("BP22-074")]).toEqual([["V3"], ["storm"]]);
    expect(d({ me: { hand: ["BP22-074"], cemetery: n(10, "V2"), playPoints: 2 } }).play("BP22-074").keywords("BP22-074")).toEqual(["storm"]);
    expect(d({ me: { hand: ["BP22-074"], cemetery: n(9, "V2"), playPoints: 2 } }).play("BP22-074").keywords("BP22-074")).toEqual([]);
  });

  it("075 / 076 ダークエンペラー — Aura; Fanfare with leader at 10 or less: evolves; evolved: destroy up to 2, leader +5; Last Words: 5 to the enemy leader", () => {
    const t = d({ me: { hand: ["BP22-075"], evolveDeck: ["BP22-076"], leaderDefense: 10, playPoints: 7 }, opp: { field: ["V5", "V3", "V1"] } });
    t.play("BP22-075").yes().pick("opp:V5", "opp:V3");
    expect([t.field("opp"), t.leader(), t.stats("BP22-075"), t.keywords("BP22-075")]).toEqual([["V1"], 15, [5, 7], ["aura"]]);
    expect(d({ me: { hand: ["BP22-075"], evolveDeck: ["BP22-076"], leaderDefense: 11, playPoints: 7 } }).play("BP22-075").stats("BP22-075")).toEqual([4, 6]);
    const lw = d({ me: { field: [{ card: "BP22-075", evolvedInto: "BP22-076" }], hand: ["QUICK-SAC"] } }).play("QUICK-SAC");
    expect(lw.leader("opp")).toBe(15);
  });

  it("077 ケルヌンノス — Fanfare, discard a 2-cost card: draw; act (4), engage, with 10 2-cost cards in the cemetery: up to 2 differently named 2-cost Abysscraft followers from it", () => {
    const t = d({ me: { hand: ["BP22-077", "V2"], deck: ["V1"], playPoints: 2 } }).play("BP22-077").yes();
    expect([t.cemetery(), t.hand()]).toEqual([["V2"], ["V1"]]);
    const cemetery = ["BP22-080", "BP22-088", "BP22-080", "BP22-077", ...n(6, "V2")];
    const a = d({ me: { field: ["BP22-077"], cemetery, playPoints: 4 } }).activate("BP22-077").pick("BP22-080").pick("BP22-088");
    expect([a.field(), a.stats("BP22-088"), a.engaged("BP22-077")]).toEqual([["BP22-077", "BP22-080", "BP22-088"], [3, 3], true]);
    expect(d({ me: { field: ["BP22-077"], cemetery: cemetery.slice(1), playPoints: 4 } }).canActivate("BP22-077")).toBe(false);
  });

  it("078 / 079 カースメーカー・スージー — Evolve (1) only with 10 2-cost cards in the cemetery; Fanfare: mill 2; evolved: 6 damage, leader +2", () => {
    expect(d({ me: { hand: ["BP22-078"], deck: ["V1", "V3", "V5"], playPoints: 2 } }).play("BP22-078").cemetery()).toEqual(["V1", "V3"]);
    expect(d({ me: { field: ["BP22-078"], cemetery: n(9, "V2"), evolveDeck: ["BP22-079"], playPoints: 1 } }).canEvolve("BP22-078")).toBe(false);
    const e = d({ me: { field: ["BP22-078"], cemetery: n(10, "V2"), evolveDeck: ["BP22-079"], leaderDefense: 10, playPoints: 1 }, opp: { field: ["V5", "V3"] } });
    e.evolve("BP22-078").pick("opp:V5");
    expect([e.field("opp"), e.leader()]).toEqual([["V3"], 12]);
  });

  it("080 ゾンビドッグ — Rush; Strike with exactly 2 ゾンビドッグ in the cemetery: +2/+2 and 2 to the enemy leader; Last Words: a ゾンビドッグ from the deck into the EX area", () => {
    const t = d({ me: { field: ["BP22-080"], cemetery: ["BP22-080", "BP22-080"] } }).attack("BP22-080", "opp:leader");
    expect([t.leader("opp"), t.stats("BP22-080"), t.keywords("BP22-080")]).toEqual([13, [5, 4], ["rush"]]);
    expect(d({ me: { field: ["BP22-080"], cemetery: ["BP22-080"] } }).attack("BP22-080", "opp:leader").leader("opp")).toBe(17);
    const lw = d({ me: { field: ["BP22-080"], hand: ["QUICK-SAC"], deck: ["V1", "BP22-080"] } }).play("QUICK-SAC").pick("BP22-080");
    expect(lw.ex()).toEqual(["BP22-080"]);
  });

  it("081 デスサイズゴブリン — Storm; during your turn a Goblin follower of yours to the cemetery (itself too): 1 to the enemy leader, leader +1; Fanfare, bury another Goblin follower: destroy", () => {
    const t = d({ me: { hand: ["BP22-081"], field: ["BP01-171"], leaderDefense: 10, playPoints: 4 }, opp: { field: ["V5", "V3"] } });
    t.play("BP22-081").yes().pick("opp:V5");
    expect([t.field(), t.field("opp"), t.leader(), t.leader("opp"), t.keywords("BP22-081")]).toEqual([["BP22-081"], ["V3"], 11, 19, ["storm"]]);
    const self = d({ me: { field: ["BP22-081"], hand: ["QUICK-SAC"], leaderDefense: 10 } }).play("QUICK-SAC");
    expect([self.leader(), self.leader("opp")]).toEqual([11, 19]);
  });

  it("082 / 083 スカーレットヴァンパイア — evolved: 2 to each enemy leader and follower, 4 with 5 Vampire cards in the cemetery", () => {
    const t = d({ me: { field: ["BP22-082"], evolveDeck: ["BP22-083"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP22-082");
    expect([t.leader("opp"), t.stats("opp:V5")]).toEqual([18, [5, 3]]);
    const v = d({ me: { field: ["BP22-082"], evolveDeck: ["BP22-083"], cemetery: n(5, "BP22-082"), playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP22-082");
    expect([v.leader("opp"), v.stats("opp:V5")]).toEqual([16, [5, 1]]);
  });

  it("084 デスキャットリーパー — Fanfare, bury another follower of yours: 5 damage, 1 to its leader, leader +1", () => {
    const t = d({ me: { hand: ["BP22-084"], field: ["V1"], leaderDefense: 10, playPoints: 2 }, opp: { field: ["V5", "V3"] } }).play("BP22-084").yes().pick("opp:V5");
    expect([t.field(), t.field("opp"), t.leader("opp"), t.leader()]).toEqual([["BP22-084"], ["V3"], 19, 11]);
  });

  it("085 フギン＆ムニン — Fanfare: choose +1 attack / Storm / pay 1: another one from the deck", () => {
    expect(d({ me: { hand: ["BP22-085"], playPoints: 2 } }).play("BP22-085").choose("attack").stats("BP22-085")).toEqual([3, 2]);
    expect(d({ me: { hand: ["BP22-085"], playPoints: 2 } }).play("BP22-085").choose("storm").keywords("BP22-085")).toEqual(["storm"]);
    const t = d({ me: { hand: ["BP22-085"], deck: ["V1", "BP22-085"], playPoints: 3 } }).play("BP22-085").choose("search").yes().pick("BP22-085");
    expect([t.field(), t.pp()]).toEqual([["BP22-085", "BP22-085"], 0]);
  });

  it("086 / 087 霹靂の悪魔 — Fanfare and evolved: 2 damage, leader +2, draw", () => {
    const t = d({ me: { hand: ["BP22-086"], deck: ["V1"], leaderDefense: 10, playPoints: 5 }, opp: { field: ["V5", "V3"] } }).play("BP22-086").pick("opp:V5");
    expect([t.stats("opp:V5"), t.leader(), t.hand()]).toEqual([[5, 3], 12, ["V1"]]);
    const e = d({ me: { field: ["BP22-086"], evolveDeck: ["BP22-087"], deck: ["V1"], leaderDefense: 10, playPoints: 1 }, opp: { field: ["V5", "V3"] } });
    e.evolve("BP22-086").pick("opp:V3");
    expect([e.stats("opp:V3"), e.leader(), e.hand()]).toEqual([[3, 2], 12, ["V1"]]);
  });

  it("088 よろめく不死者 — Fanfare: +1/+1 if it came from the cemetery; Last Words: the opponent buries a follower of theirs (their choice)", () => {
    expect(d({ me: { hand: ["BP22-088"], playPoints: 2 } }).play("BP22-088").stats("BP22-088")).toEqual([2, 2]);
    const t = d({ me: { field: ["BP22-088"], hand: ["QUICK-SAC"] }, opp: { field: ["V5", "V3"] } }).play("QUICK-SAC").pick("opp:V3");
    expect([t.field("opp"), t.cemetery("opp")]).toEqual([["V5"], ["V3"]]);
  });

  it("089 ゴブリンゾンビ — Fanfare, discard a Goblin card: draw, +1 attack with 3 Goblin cards in the cemetery", () => {
    const t = d({ me: { hand: ["BP22-089", "BP01-171"], cemetery: ["BP01-171", "BP01-171"], deck: ["V1"], playPoints: 1 } }).play("BP22-089").yes();
    expect([t.hand(), t.stats("BP22-089")]).toEqual([["V1"], [3, 2]]);
    const s = d({ me: { hand: ["BP22-089", "BP01-171"], cemetery: ["BP01-171"], deck: ["V1"], playPoints: 1 } }).play("BP22-089").yes();
    expect([s.hand(), s.stats("BP22-089")]).toEqual([["V1"], [2, 2]]);
  });

  it("090 ゴシックリーパー — Fanfare: mill 2 or recover 2; Necrocharge (10): up to 2", () => {
    expect(d({ me: { hand: ["BP22-090"], deck: ["V1", "V3", "V5"], playPoints: 4 } }).play("BP22-090").choose("mill").cemetery()).toEqual(["V1", "V3"]);
    const t = d({ me: { hand: ["BP22-090"], cemetery: n(10, "V2"), deck: ["V1", "V3", "V5"], playPoints: 4, maxPlayPoints: 6 } }).play("BP22-090").choose("mill", "recover");
    expect([t.cemetery().length, t.pp()]).toEqual([12, 2]);
  });

  it("091 デッドスタンピード — up to 3 Departed followers costing 6 in total from the cemetery onto the field, with Rush", () => {
    const t = d({ me: { hand: ["BP22-091"], cemetery: ["BP22-080", "BP22-088", "BP01-117", "BP22-074"], playPoints: 8 } }).play("BP22-091");
    t.pick("BP22-080").pick("BP22-088").pick("BP01-117").flush();
    expect([t.field(), t.keywords("BP22-088"), t.keywords("BP01-117"), t.cemetery()]).toEqual([["BP22-080", "BP22-088", "BP01-117"], ["rush"], ["rush"], ["BP22-074", "BP22-091"]]);
  });
});
