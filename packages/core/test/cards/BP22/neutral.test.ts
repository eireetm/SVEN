import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP22 Neutral (110–115, T02, T03). Pre-release cards with Japanese names (data/preview.ts). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5
// (Neutral). BP01-171 Goblin (1c 2/2), BP13-116 Armored Goblin (2c Goblin with Ward).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const GOBLIN = "BP01-171";

describe("BP22 Neutral", () => {
  it("110 ゴブリンエンペラー — another Goblin follower entering: 2 damage; Fanfare: up to 2 Goblin cards costing 4 in total from the top 5 into the EX area, 0 this turn", () => {
    const t = d({ me: { hand: ["BP22-110"], deck: [GOBLIN, "BP22-113", "V1", "BP22-110", "V3"], playPoints: 5 }, opp: { field: ["V5", "V3"] } });
    t.play("BP22-110").pick(GOBLIN).pick("BP22-113").order();
    expect([t.ex(), t.canPlay(`${GOBLIN}@ex`), t.canPlay("BP22-113@ex"), t.zone("me", "deck").length]).toEqual([[GOBLIN, "BP22-113"], true, true, 3]);
    t.play(`${GOBLIN}@ex`).pick("opp:V5");
    expect([t.stats("opp:V5"), t.pp()]).toEqual([[5, 3], 0]);
  });

  it("111 安寧の降臨 — destroy an enemy card; with no super-evolution point, a シャドウジェネラル (Bane, Ward)", () => {
    const t = d({ me: { hand: ["BP22-111"], superEvolutionPoints: 0, playPoints: 3 }, opp: { field: ["V5", "AMULET"] } }).play("BP22-111").pick("opp:AMULET").none();
    expect([t.field("opp"), t.field(), t.keywords("BP22-T02"), t.stats("BP22-T02")]).toEqual([["V5"], ["BP22-T02"], ["bane", "ward"], [2, 8]]);
    expect(d({ me: { hand: ["BP22-111"], superEvolutionPoints: 1, playPoints: 3 }, opp: { field: ["V5"] } }).play("BP22-111").field()).toEqual([]);
    expect(d({ me: { hand: ["BP22-111"], playPoints: 3 } }).canPlay("BP22-111")).toBe(false);
  });

  it("112 メチャカワ傭兵・フィーナ — Fanfare: a Goblin card from the top 4, then may put a 2-cost-or-less Goblin follower from the hand onto the field", () => {
    const t = d({ me: { hand: ["BP22-112"], deck: ["V1", GOBLIN, "V3", "V5"], playPoints: 3 } }).play("BP22-112").pick(GOBLIN).order().pick(GOBLIN);
    expect([t.field(), t.hand()]).toEqual([["BP22-112", GOBLIN], []]);
  });

  it("113 / 114 ゴブリンリーダー — another Goblin follower entering: +1 attack; evolved: a 2-cost-or-less Goblin card from the top 4 into the EX area, 2 less this turn", () => {
    const t = d({ me: { field: ["BP22-113"], hand: [GOBLIN], playPoints: 1 } }).play(GOBLIN);
    expect(t.stats(GOBLIN)).toEqual([3, 2]);
    const e = d({ me: { field: ["BP22-113"], evolveDeck: ["BP22-114"], deck: ["V1", "BP13-116", "V3", "V5"], playPoints: 1 } }).evolve("BP22-113").pick("BP13-116").order();
    expect([e.ex(), e.canPlay("BP13-116@ex")]).toEqual([["BP13-116"], true]);
    e.play("BP13-116@ex").none();
    expect([e.stats("BP13-116"), e.stats("BP22-113")]).toEqual([[3, 2], [2, 2]]);
  });

  it("115 ミニゴブリンメイジ — Fanfare: a Goblin card from the top 2, the rest into the cemetery (Japanese text)", () => {
    const t = d({ me: { hand: ["BP22-115"], deck: [GOBLIN, "V1", "V3"], playPoints: 2 } }).play("BP22-115").pick(GOBLIN);
    expect([t.hand(), t.cemetery(), t.zone("me", "deck")]).toEqual([[GOBLIN], ["V1"], ["V3"]]);
  });

  it("T02 / T03 シャドウジェネラル / レディアントアーティファクト — Bane and Ward; Storm", () => {
    expect(d({ me: { field: ["BP22-T02", "BP22-T03"] } }).keywords("BP22-T02")).toEqual(["bane", "ward"]);
    expect(d({ me: { field: ["BP22-T03"] } }).keywords("BP22-T03")).toEqual(["storm"]);
  });
});
