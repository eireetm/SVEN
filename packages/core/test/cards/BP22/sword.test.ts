import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP22 Swordcraft (019–036). Pre-release cards with Japanese names (data/preview.ts). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5
// (Neutral); QUICK-SAC (0) destroys one of your followers. Tokens: BP14-T02 Glittering Gold, BP01-T05 Knight (Officer, 1c),
// BP01-T07 Steelclad Knight (2c), BP02-T02 Shield Guardian, BP01-T06 Viking. BP12-023 Alwida (Commander and Thief, 5c).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const GOLD = "BP14-T02";
const KNIGHT = "BP01-T05";

describe("BP22 Swordcraft", () => {
  it("019 ビクトリーブレイダー — Rush, Assail; refreshes when it deals combat damage (not attacking a leader); Strike: +0/+1, recover 1", () => {
    const t = d({ me: { field: ["BP22-019"], playPoints: 0, maxPlayPoints: 5 }, opp: { field: [{ card: "V3", engaged: true }] } });
    t.attack("BP22-019", "opp:V3").flush();
    expect([t.field("opp"), t.stats("BP22-019"), t.engaged("BP22-019"), t.pp(), t.keywords("BP22-019")]).toEqual([[], [4, 6], false, 1, ["rush", "assail"]]);
    const l = d({ me: { field: ["BP22-019"] } }).attack("BP22-019", "opp:leader").flush();
    expect([l.leader("opp"), l.engaged("BP22-019")]).toEqual([16, true]);
  });

  it("020 ゴールデンウォーリアー — a Glittering Gold put into your EX area: 1 damage; Fanfare: a Gold, recover 3 with 4 Golds", () => {
    const t = d({ me: { field: ["BP22-020"], hand: ["BP22-034"], playPoints: 3 }, opp: { field: ["V5", "V3"] } }).play("BP22-034").pick("opp:V5");
    expect([t.ex(), t.stats("opp:V5")]).toEqual([[GOLD], [5, 4]]);
    const f = d({ me: { hand: ["BP22-020"], ex: n(3, GOLD), playPoints: 4, maxPlayPoints: 7 }, opp: { field: ["V5", "V3"] } }).play("BP22-020").pick("opp:V3");
    expect([f.pp(), f.stats("opp:V3")]).toEqual([3, [3, 3]]);
    expect(d({ me: { hand: ["BP22-020"], ex: n(2, GOLD), playPoints: 4, maxPlayPoints: 7 } }).play("BP22-020").pp()).toBe(0);
  });

  it("021 / 022 千金武装の大参謀・アルメリゼ — Fanfare: a Gold, leader +2; super-evolved: gains Gold → 1 to each enemy (its own Gold too); act, banish 2 Golds: 3 damage or draw 2, one to the bottom", () => {
    const t = d({ me: { hand: ["BP22-021"], leaderDefense: 10, playPoints: 2 } }).play("BP22-021");
    expect([t.ex(), t.leader()]).toEqual([[GOLD], 12]);
    const s = d({ me: { field: ["BP22-021"], evolveDeck: ["BP22-022"], ...SUPER }, opp: { field: ["V3"] } }).evolve("BP22-021", { sep: true }).flush();
    expect([s.ex(), s.leader("opp"), s.stats("opp:V3")]).toEqual([[GOLD], 19, [3, 3]]);
    const a = d({ me: { field: [{ card: "BP22-021", evolvedInto: "BP22-022" }], ex: [GOLD, GOLD, "V1"] }, opp: { field: ["V5", "V3"] } });
    a.activate("BP22-021").choose("damage").pick("opp:V5");
    expect([a.ex(), a.stats("opp:V5")]).toEqual([["V1"], [5, 2]]);
    const b = d({ me: { field: [{ card: "BP22-021", evolvedInto: "BP22-022" }], ex: [GOLD, GOLD], hand: ["V5"], deck: ["V1", "V3", "V1"] }, opp: { field: ["V5"] } });
    b.activate("BP22-021").choose("draw").pick("V5");
    expect([b.hand(), b.zone("me", "deck")]).toEqual([["V1", "V3"], ["V1", "V5"]]);
  });

  it("023 / 024 アサルトナイト — Fanfare with ビクトリーブレイダー: evolves (no cost); evolved: Assail, a follower of yours takes no combat damage this turn", () => {
    const t = d({ me: { hand: ["BP22-023"], field: ["BP22-019"], evolveDeck: ["BP22-024"], playPoints: 1 } }).play("BP22-023").yes();
    expect([t.stats("BP22-023"), t.keywords("BP22-023"), t.pp()]).toEqual([[3, 3], ["assail"], 0]);
    expect(d({ me: { hand: ["BP22-023"], evolveDeck: ["BP22-024"], playPoints: 1 } }).play("BP22-023").stats("BP22-023")).toEqual([2, 2]);
    const e = d({ me: { field: ["BP22-023", "V1"], evolveDeck: ["BP22-024"], playPoints: 2 }, opp: { field: [{ card: "V5", engaged: true }] } });
    e.evolve("BP22-023").pick("V1").attack("V1", "opp:V5");
    expect([e.stats("V1"), e.stats("opp:V5")]).toEqual([[2, 2], [5, 3]]);
  });

  it("025 ファングスレイヤー — Rush, Assail, Bane; during your turn an enemy follower put into the cemetery: its attack to its leader", () => {
    const t = d({ me: { field: ["BP22-025"] }, opp: { field: [{ card: "V5", engaged: true }] } }).attack("BP22-025", "opp:V5");
    expect([t.field("opp"), t.leader("opp"), t.keywords("BP22-025")]).toEqual([[], 15, ["rush", "assail", "bane"]]);
  });

  it("026 クレイモアマスター — Storm; 3 less with 5 faceup evolved followers in the evolve deck, 5 less with 10 (advanced ones don't count)", () => {
    expect(d({ me: { hand: ["BP22-026"], faceUpEvolveDeck: n(5, "BP22-024"), playPoints: 2 } }).canPlay("BP22-026")).toBe(true);
    expect(d({ me: { hand: ["BP22-026"], faceUpEvolveDeck: n(4, "BP22-024"), playPoints: 2 } }).canPlay("BP22-026")).toBe(false);
    expect(d({ me: { hand: ["BP22-026"], faceUpEvolveDeck: n(10, "BP22-024"), playPoints: 0 } }).canPlay("BP22-026")).toBe(true);
    expect(d({ me: { hand: ["BP22-026"], faceUpEvolveDeck: n(5, "BP13-002"), playPoints: 4 } }).canPlay("BP22-026")).toBe(false);
  });

  it("027 / 028 アックスパイレーツ — Fanfare with a Commander-and-Thief follower: evolves; evolved: a Viking", () => {
    const t = d({ me: { hand: ["BP22-027"], field: ["BP12-023"], evolveDeck: ["BP22-028"], playPoints: 3 } }).play("BP22-027").yes();
    expect([t.stats("BP22-027"), t.field()]).toEqual([[3, 4], ["BP12-023", "BP22-027", "BP01-T06"]]);
    expect(d({ me: { hand: ["BP22-027"], field: ["BP22-019"], evolveDeck: ["BP22-028"], playPoints: 3 } }).play("BP22-027").field()).toEqual(["BP22-019", "BP22-027"]);
  });

  it("029 アームドバトラー — Fanfare: a Commander card from the top 3; act with a Commander card on your field: 1 damage", () => {
    const t = d({ me: { hand: ["BP22-029"], deck: ["V1", "BP22-035", "V3"], playPoints: 2 } }).play("BP22-029").pick("BP22-035").order();
    expect(t.hand()).toEqual(["BP22-035"]);
    const a = d({ me: { field: ["BP22-029", "BP22-035"] }, opp: { field: ["V5", "V3"] } }).activate("BP22-029").pick("opp:V5");
    expect(a.stats("opp:V5")).toEqual([5, 4]);
    expect(d({ me: { field: ["BP22-029"] }, opp: { field: ["V5"] } }).canActivate("BP22-029")).toBe(false);
  });

  it("030 シールドフォーメーション — 3 knights into the EX area (choose with less room); with 5 cards there the next Swordcraft token follower costs 2 less", () => {
    const t = d({ me: { hand: ["BP22-030"], ex: ["V1", "V3"], playPoints: 1 } }).play("BP22-030");
    expect([t.ex(), t.canPlay("BP01-T07@ex")]).toEqual([["V1", "V3", "BP01-T07", "BP02-T02", KNIGHT], true]);
    t.play("BP01-T07@ex");
    expect([t.pp(), t.canPlay(`${KNIGHT}@ex`)]).toEqual([0, false]);
    const c = d({ me: { hand: ["BP22-030"], ex: ["V1", "V3", "V1", "V3"], playPoints: 1 } }).play("BP22-030").choose("Knight");
    expect(c.ex()).toEqual(["V1", "V3", "V1", "V3", KNIGHT]);
  });

  it("031 / 032 望遠の船長 — Ward; Fanfare: a 3-cost-or-less and another 2-cost-or-less follower from the top 4 onto the field; evolved: 5 damage", () => {
    const t = d({ me: { hand: ["BP22-031"], deck: ["V3", "V1", "V5", "BP22-023"], playPoints: 6 } }).play("BP22-031").none();
    t.pick("V3").pick("V1").order();
    expect([t.field(), t.zone("me", "deck")]).toEqual([["BP22-031", "V3", "V1"], ["V5", "BP22-023"]]);
    const e = d({ me: { field: ["BP22-031"], evolveDeck: ["BP22-032"], playPoints: 1 }, opp: { field: ["V5", "V3"] } }).evolve("BP22-031").pick("opp:V5");
    expect([e.field("opp"), e.keywords("BP22-031")]).toEqual([["V3"], ["ward"]]);
  });

  it("033 / 034 エレガントバンデッド / ブレードバンデッド — Fanfare and Last Words: a Gold; Storm, Fanfare: a Gold", () => {
    const t = d({ me: { hand: ["BP22-033", "QUICK-SAC"], playPoints: 1 } }).play("BP22-033").play("QUICK-SAC");
    expect(t.ex()).toEqual([GOLD, GOLD]);
    const b = d({ me: { hand: ["BP22-034"], playPoints: 3 } }).play("BP22-034");
    expect([b.ex(), b.keywords("BP22-034")]).toEqual([[GOLD], ["storm"]]);
  });

  it("035 清白の騎士 — Fanfare, banish an Officer follower from your EX area: draw", () => {
    const t = d({ me: { hand: ["BP22-035"], ex: [KNIGHT, "V1"], deck: ["V3"], playPoints: 1 } }).play("BP22-035").yes();
    expect([t.ex(), t.hand()]).toEqual([["V1"], ["V3"]]);
    expect(d({ me: { hand: ["BP22-035"], ex: ["V1"], deck: ["V3"], playPoints: 1 } }).play("BP22-035").hand()).toEqual([]);
  });

  it("036 放浪の騎士 — Rush; Last Words: may put a Knight onto the field or into the EX area", () => {
    const t = d({ me: { field: ["BP22-036"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").choose("field");
    expect([t.field(), t.keywords(KNIGHT)]).toEqual([[KNIGHT], []]);
    expect(d({ me: { field: ["BP22-036"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").choose("ex").ex()).toEqual([KNIGHT]);
    expect(d({ me: { field: ["BP22-036"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").choose("none").ex()).toEqual([]);
    expect(d({ me: { field: ["BP22-036"] } }).keywords("BP22-036")).toEqual(["rush"]);
  });
});
