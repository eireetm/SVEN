import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP22 Forestcraft (001–018, 116). BP22 is a pre-release set: its cards have their Japanese names (data/preview.ts). V1 is 1c
// 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). Pixie tokens: BP01-T03 Fairy, BP01-T02 Fairy Wisp. Crystalia: BP02-008 Crystalia Lily
// (evolved BP02-009), BP16-009 (3c). ECP01-049 Jungle Pocket (Fanfare: discard an Umamusume card: draw); CP01-085 Carrot.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const FAIRY = "BP01-T03";
const CARROT = "CP01-085";

describe("BP22 Forestcraft", () => {
  it("001 ブリリアントフェアリー — your Pixie token followers have Storm; act (0): X damage, X = cards played this turn, once per turn", () => {
    const t = d({ me: { field: ["BP22-001", FAIRY, "BP22-008"], playedThisTurn: 2 }, opp: { field: ["V5", "V3"] } });
    expect([t.keywords(FAIRY), t.keywords("BP22-008")]).toEqual([["storm"], []]);
    t.activate("BP22-001").pick("opp:V5");
    expect([t.stats("opp:V5"), t.canActivate("BP22-001")]).toEqual([[5, 3], false]);
    expect(d({ me: { field: ["BP22-001"] }, opp: { field: [FAIRY] } }).keywords(`opp:${FAIRY}`)).toEqual([]);
  });

  it("002 デッドリーエルフ — Bane; Fanfare, banish X Pixie cards from the EX area: draw X, discard X; act with 20 Forestcraft cards in the cemetery: 6 to each enemy", () => {
    const t = d({ me: { hand: ["BP22-002", "V1"], ex: [FAIRY, FAIRY, "BP22-008"], deck: ["V3", "V5"], playPoints: 3 } });
    t.play("BP22-002").yes().pick(FAIRY, FAIRY).pick("V1", "V3");
    expect([t.ex(), t.hand(), t.cemetery(), t.keywords("BP22-002")]).toEqual([["BP22-008"], ["V5"], ["V1", "V3"], ["bane"]]);
    const a = d({ me: { field: ["BP22-002"], cemetery: n(20, "BP22-009") }, opp: { field: ["V5", "V3"] } }).activate("BP22-002");
    expect([a.leader("opp"), a.field("opp"), a.engaged("BP22-002")]).toEqual([14, [], true]);
    expect(d({ me: { field: ["BP22-002"], cemetery: n(19, "BP22-009") } }).canActivate("BP22-002")).toBe(false);
  });

  it("003 / 004 永久なる輝き・エリン — another Crystalia follower put onto your field evolves (no cost, may decline); Fanfare: a Crystalia card from the top 4; evolved: the next Crystalia card costs 3 less", () => {
    const t = d({ me: { field: ["BP22-003"], hand: ["BP02-008"], evolveDeck: ["BP02-009"], playPoints: 2 } });
    t.play("BP02-008").pending("BP22-003").yes().flush();
    expect([t.stats("BP02-008"), t.pp()]).toEqual([[2, 4], 0]);
    const no = d({ me: { field: ["BP22-003"], hand: ["BP02-008"], evolveDeck: ["BP02-009"], playPoints: 2 } });
    expect(no.play("BP02-008").pending("BP22-003").no().flush().stats("BP02-008")).toEqual([1, 3]);
    const f = d({ me: { hand: ["BP22-003"], deck: ["V1", "BP02-008", "V3", "V5", "V1"], playPoints: 4 } }).play("BP22-003").pick("BP02-008").order();
    expect([f.hand(), f.zone("me", "deck")[0]]).toEqual([["BP02-008"], "V1"]);
    const e = d({ me: { field: ["BP22-003"], hand: ["BP16-009", "BP02-008"], evolveDeck: ["BP22-004"], playPoints: 1 } }).evolve("BP22-003");
    expect([e.canPlay("BP16-009"), e.canPlay("BP02-008")]).toEqual([true, true]);
  });

  it("005 / 006 フラワーフォックス — 1 less with ブリリアントフェアリー on your field; evolved: a Fairy Wisp, and with it +1/+1 to your Pixie token followers in the EX area", () => {
    expect(d({ me: { hand: ["BP22-005"], field: ["BP22-001"], playPoints: 0 } }).canPlay("BP22-005")).toBe(true);
    expect(d({ me: { hand: ["BP22-005"], playPoints: 0 } }).canPlay("BP22-005")).toBe(false);
    const t = d({ me: { field: ["BP22-005", "BP22-001"], ex: [FAIRY, "BP22-008"], evolveDeck: ["BP22-006"], playPoints: 1 } }).evolve("BP22-005");
    expect([t.ex(), t.stats(`${FAIRY}@ex`), t.stats("BP01-T02@ex"), t.stats("BP22-008@ex")]).toEqual([[FAIRY, "BP22-008", "BP01-T02"], [2, 2], [2, 2], [1, 1]]);
    const s = d({ me: { field: ["BP22-005"], ex: [FAIRY], evolveDeck: ["BP22-006"], playPoints: 1 } }).evolve("BP22-005");
    expect(s.stats(`${FAIRY}@ex`)).toEqual([1, 1]);
  });

  it("007 アイヴィーキング — X less, X = Pixie cards in your EX area; Fanfare: destroy, draw 2, discard 1 (nothing without a target)", () => {
    const t = d({ me: { hand: ["BP22-007"], ex: n(3, FAIRY), deck: ["V1", "V3"], playPoints: 4 }, opp: { field: ["V5", "V3"] } });
    t.play("BP22-007").pick("opp:V5").pick("V1");
    expect([t.field("opp"), t.hand(), t.cemetery(), t.pp()]).toEqual([["V3"], ["V3"], ["V1"], 0]);
    expect(d({ me: { hand: ["BP22-007"], deck: ["V1", "V3"], playPoints: 7 } }).play("BP22-007").hand()).toEqual([]);
  });

  it("008 ブラストフェアリー — Fanfare: damage equal to the Pixie cards in your EX area", () => {
    const t = d({ me: { hand: ["BP22-008"], ex: [FAIRY, FAIRY, "BP22-011", "V1"], playPoints: 1 }, opp: { field: ["V5", "V3"] } });
    expect(t.play("BP22-008").pick("opp:V5").stats("opp:V5")).toEqual([5, 2]);
  });

  it("009 / 010 清き泉のエルフプリンセスメイジ — Fanfare: 2 Fairies; evolved: a Pixie or Elf card from the top 4", () => {
    expect(d({ me: { hand: ["BP22-009"], playPoints: 2 } }).play("BP22-009").ex()).toEqual([FAIRY, FAIRY]);
    const e = d({ me: { field: ["BP22-009"], evolveDeck: ["BP22-010"], deck: ["V1", "BP22-015", "BP22-008", "V3"], playPoints: 1 } });
    expect(e.evolve("BP22-009").pick("BP22-015").order().hand()).toEqual(["BP22-015"]);
  });

  it("011 アクアフェアリー — Fanfare: a Fairy; with 5 Pixie cards in the EX area (the new one counts): leader +1, draw", () => {
    const t = d({ me: { hand: ["BP22-011"], ex: n(4, FAIRY), deck: ["V1"], leaderDefense: 10, playPoints: 1 } }).play("BP22-011");
    expect([t.leader(), t.hand()]).toEqual([11, ["V1"]]);
    const s = d({ me: { hand: ["BP22-011"], ex: [FAIRY, FAIRY, "V1"], deck: ["V1"], leaderDefense: 10, playPoints: 1 } }).play("BP22-011");
    expect([s.leader(), s.hand(), s.ex()]).toEqual([10, [], [FAIRY, FAIRY, "V1", FAIRY]]);
  });

  it("012 水晶の指揮者・リリィ — act, engage: Storm to another Crystalia follower, with 3 Crystalia cards in the cemetery", () => {
    const t = d({ me: { field: ["BP22-012", "BP02-008", "BP02-001"], cemetery: n(3, "BP22-003") } }).activate("BP22-012").pick("BP02-008");
    expect([t.keywords("BP02-008"), t.engaged("BP22-012")]).toEqual([["storm"], true]);
    expect(d({ me: { field: ["BP22-012", "BP02-008"], cemetery: n(2, "BP22-003") } }).canActivate("BP22-012")).toBe(false);
  });

  it("013 / 014 冷徹のダークエルフ — Fanfare, banish 2 Pixie tokens from the EX area: 5 damage and draw; evolved: destroy", () => {
    const t = d({ me: { hand: ["BP22-013"], ex: [FAIRY, FAIRY, "BP22-008"], deck: ["V1"], playPoints: 5 }, opp: { field: ["V5", "V3"] } });
    t.play("BP22-013").yes().pick("opp:V5");
    expect([t.field("opp"), t.ex(), t.hand()]).toEqual([["V3"], ["BP22-008"], ["V1"]]);
    const no = d({ me: { hand: ["BP22-013"], ex: [FAIRY, FAIRY], deck: ["V1"], playPoints: 5 }, opp: { field: ["V5", "V3"] } });
    expect(no.play("BP22-013").no().hand()).toEqual([]);
    const e = d({ me: { field: ["BP22-013"], evolveDeck: ["BP22-014"], playPoints: 1 }, opp: { field: ["V5", "V3"] } }).evolve("BP22-013").pick("opp:V5");
    expect(e.field("opp")).toEqual(["V3"]);
  });

  it("015 フェアリーブリンガー — Ward; Fanfare: 2 Fairies, draw, discard", () => {
    const t = d({ me: { hand: ["BP22-015", "V1"], deck: ["V3"], playPoints: 2 } }).play("BP22-015").none().pick("V1");
    expect([t.ex(), t.hand(), t.cemetery(), t.keywords("BP22-015")]).toEqual([[FAIRY, FAIRY], ["V3"], ["V1"], ["ward"]]);
  });

  it("016 悪戯の精霊 — Fanfare: 2 Fairies; act, banish 2 Fairies from the EX area: return an enemy follower (not without a target)", () => {
    const t = d({ me: { hand: ["BP22-016"], playPoints: 4 }, opp: { field: ["V5", "V3"] } }).play("BP22-016");
    expect(t.ex()).toEqual([FAIRY, FAIRY]);
    t.activate("BP22-016").pick("opp:V5");
    expect([t.ex(), t.field("opp"), t.hand("opp")]).toEqual([[], ["V3"], ["V5"]]);
    expect(d({ me: { field: ["BP22-016"], ex: [FAIRY, FAIRY] } }).canActivate("BP22-016")).toBe(false);
  });

  it("017 ダンジョンフェアリー — once on each of your turns, when cards of yours leave the EX area: that many Fairies", () => {
    const t = d({ me: { field: ["BP22-017"], ex: [FAIRY, FAIRY], playPoints: 2 } }).play(`${FAIRY}@ex`);
    expect([t.field(), t.ex()]).toEqual([["BP22-017", FAIRY], [FAIRY, FAIRY]]);
    expect(t.play(`${FAIRY}@ex`).ex()).toEqual([FAIRY]);
    const two = d({ me: { field: ["BP22-017"], hand: ["BP22-002"], ex: n(3, FAIRY), deck: ["V1", "V3"], playPoints: 3 } });
    two.play("BP22-002").yes().pick(FAIRY, FAIRY).flush();
    expect(two.ex()).toEqual(n(3, FAIRY));
  });

  it("018 シードショット — Quick; 3 damage; with a Verdant follower on your field: 1 to the enemy leader and draw", () => {
    const t = d({ me: { hand: ["BP22-018"], field: ["BP22-005"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5", "V3"] } }).play("BP22-018").pick("opp:V5");
    expect([t.stats("opp:V5"), t.leader("opp"), t.hand()]).toEqual([[5, 2], 19, ["V1"]]);
    const s = d({ me: { hand: ["BP22-018"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5", "V3"] } }).play("BP22-018").pick("opp:V5");
    expect([s.leader("opp"), s.hand()]).toEqual([20, []]);
    expect(d({ me: { hand: ["BP22-018"], field: ["BP22-005"], playPoints: 2 } }).canPlay("BP22-018")).toBe(false);
  });

  it("116 〔勝利目指して〕ハルウララ — discarded by an Umamusume card's ability: draw; serve (1); Fanfare: +1/+1 to another Umamusume follower", () => {
    const t = d({ me: { hand: ["ECP01-049", "BP22-116"], deck: ["V1", "V3"], playPoints: 2 } }).play("ECP01-049").yes().flush();
    expect([t.cemetery(), t.hand()]).toEqual([["BP22-116"], ["V1", "V3"]]);
    const s = d({ me: { field: ["BP22-116"], evolveDeck: [CARROT], playPoints: 1 } }).activate("BP22-116");
    expect(s.game.reader().isRacing(s.id("BP22-116"))).toBe(true);
    const f = d({ me: { hand: ["BP22-116"], field: ["ECP01-049", "V1"], playPoints: 2 } }).play("BP22-116");
    expect([f.stats("ECP01-049"), f.stats("V1")]).toEqual([[4, 3], [2, 2]]);
  });
});
