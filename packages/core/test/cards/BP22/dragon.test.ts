import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP22 Dragoncraft (056–073, 117, 118). Pre-release cards with Japanese names (data/preview.ts). V1 is 1c 2/2, V3 3c 3/4, V5 5c
// 5/5 (Neutral); QUICK-SAC (0) destroys one of your followers. BP01-085 Dragonewt Scholar (2c Dragonewt), BP05-065 Airship Whale
// (5c Marine, エアシップホエール), BP20-070 (act 0: 1 damage to a follower of yours), BP21-058 Lumiore, CP01-013 / 009 Umamusume
// followers, CP01-085 Carrot.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const CARROT = "CP01-085";

describe("BP22 Dragoncraft", () => {
  it("056 / 057 イグニスドラゴン — discarded from the hand, pay 2: +1 max PP; Fanfare with 3 or fewer cards in hand: evolves; evolved, Strike: its attack to each enemy follower", () => {
    const t = d({ me: { hand: ["BP22-066", "BP22-056"], playPoints: 5, maxPlayPoints: 5 }, opp: { field: ["V5", "V3"] } });
    t.play("BP22-066").none().yes().pending("BP22-056").yes().pick("opp:V5");
    expect([t.pp(), t.game.state.players[0].maxPlayPoints, t.cemetery(), t.stats("opp:V5")]).toEqual([2, 6, ["BP22-056"], [5, 3]]);
    const f = d({ me: { hand: ["BP22-056", "V1", "V1", "V1"], evolveDeck: ["BP22-057"], playPoints: 7 } }).play("BP22-056").yes();
    expect(f.stats("BP22-056")).toEqual([5, 7]);
    expect(d({ me: { hand: ["BP22-056", "V1", "V1", "V1", "V1"], evolveDeck: ["BP22-057"], playPoints: 7 } }).play("BP22-056").stats("BP22-056")).toEqual([4, 6]);
    const s = d({ me: { field: [{ card: "BP22-056", evolvedInto: "BP22-057" }] }, opp: { field: [{ card: "V5", engaged: true }, "V3"] } }).attack("BP22-056", "opp:V5");
    expect(s.field("opp")).toEqual([]);
  });

  it("058 ブルータルドラゴニュート — Storm; Fanfare with 2 Dragonewt cards in the EX area: recover 2", () => {
    const t = d({ me: { hand: ["BP22-058"], ex: ["BP01-085", "BP01-085"], playPoints: 4 } }).play("BP22-058");
    expect([t.pp(), t.keywords("BP22-058")]).toEqual([2, ["storm"]]);
    expect(d({ me: { hand: ["BP22-058"], ex: ["BP01-085"], playPoints: 4 } }).play("BP22-058").pp()).toBe(0);
  });

  it("059 オーシャンスター・ジゼル — another Marine follower entering: +1/+1; Fanfare: a ホエール Marine follower from the deck into the EX area, 5 less this turn", () => {
    const t = d({ me: { hand: ["BP22-059"], deck: ["BP05-065", "V1"], playPoints: 6 } }).play("BP22-059").pick("BP05-065");
    expect([t.ex(), t.canPlay("BP05-065@ex")]).toEqual([["BP05-065"], true]);
    t.play("BP05-065@ex");
    expect(t.stats("BP05-065")).toEqual([6, 6]);
  });

  it("060 / 061 黒白の乱舞・ノール＆ブラン — Evolve (4), or (1) with Lumiore on your field; evolved: Ward, while engaged no ability damage and not destroyed by abilities", () => {
    expect(d({ me: { field: ["BP22-060", "BP21-058"], evolveDeck: ["BP22-061"], playPoints: 1 } }).canEvolve("BP22-060")).toBe(true);
    expect(d({ me: { field: ["BP22-060"], evolveDeck: ["BP22-061"], playPoints: 1 } }).canEvolve("BP22-060")).toBe(false);
    expect(d({ me: { field: ["BP22-060"], evolveDeck: ["BP22-061"], playPoints: 4 } }).canEvolve("BP22-060")).toBe(true);
    const engaged = { card: "BP22-060", evolvedInto: "BP22-061", engaged: true };
    const t = d({ me: { field: [engaged, "BP20-070"], hand: ["QUICK-SAC"] } }).activate("BP20-070").pick("BP22-060").play("QUICK-SAC").pick("BP22-060");
    expect([t.stats("BP22-060"), t.field(), t.keywords("BP22-060")]).toEqual([[4, 4], ["BP22-060", "BP20-070"], ["ward"]]);
    const up = d({ me: { field: [{ card: "BP22-060", evolvedInto: "BP22-061" }, "BP20-070"], hand: ["QUICK-SAC"] } });
    up.activate("BP20-070").pick("BP22-060");
    expect(up.stats("BP22-060")).toEqual([4, 3]);
    expect(up.play("QUICK-SAC").pick("BP22-060").field()).toEqual(["BP20-070"]);
  });

  it("062 ジュエルドラゴン — your イグニスドラゴン have Assail; Fanfare: up to 2 of a 貫く咆哮 from the cemetery into the EX area / pay 5: an イグニスドラゴン from the cemetery onto the field", () => {
    const t = d({ me: { hand: ["BP22-062"], cemetery: ["BP22-067", "BP22-056"], playPoints: 6 } }).play("BP22-062").choose("roar", "ignis").yes();
    expect([t.ex(), t.field(), t.keywords("BP22-056"), t.pp()]).toEqual([["BP22-067"], ["BP22-062", "BP22-056"], ["assail"], 0]);
    const no = d({ me: { hand: ["BP22-062"], cemetery: ["BP22-067", "BP22-056"], playPoints: 6 } }).play("BP22-062").choose("roar", "ignis").no();
    expect([no.ex(), no.field(), no.pp()]).toEqual([["BP22-067"], ["BP22-062"], 5]);
  });

  it("063 紅炎の竜爪・エチカ — Rush; Strike: damage equal to the Dragonewt cards in your EX area; Fanfare: a Dragonewt follower from the top 2 into the EX area", () => {
    const t = d({ me: { hand: ["BP22-063"], deck: ["V1", "BP01-085", "V3"], playPoints: 2 }, opp: { field: [{ card: "V5", engaged: true }, "V3"] } });
    t.play("BP22-063").pick("BP01-085").attack("BP22-063", "opp:V5").pick("opp:V3");
    expect([t.ex(), t.stats("opp:V3"), t.keywords("BP22-063")]).toEqual([["BP01-085"], [3, 3], ["rush"]]);
  });

  it("064 / 065 珊瑚礁の精霊 — evolved, put a Marine card from your hand into the EX area: 4 damage and leader +1", () => {
    const t = d({ me: { field: ["BP22-064"], hand: ["BP05-065", "V1"], evolveDeck: ["BP22-065"], leaderDefense: 10, playPoints: 1 }, opp: { field: ["V5", "V3"] } });
    t.evolve("BP22-064").yes().pick("opp:V5");
    expect([t.ex(), t.stats("opp:V5"), t.leader()]).toEqual([["BP05-065"], [5, 1], 11]);
  });

  it("066 シールドドラゴン — Ward; once on each of your turns, when you discard: 2 damage; Fanfare, discard a 7-cost-or-more Dragoncraft card: recover 2", () => {
    const t = d({ me: { hand: ["BP22-066", "BP22-071"], playPoints: 3, maxPlayPoints: 5 }, opp: { field: ["V5", "V3"] } }).play("BP22-066").none().yes().pick("opp:V5");
    expect([t.pp(), t.cemetery(), t.stats("opp:V5"), t.keywords("BP22-066")]).toEqual([2, ["BP22-071"], [5, 3], ["ward"]]);
    expect(d({ me: { hand: ["BP22-066", "V5"], playPoints: 3 } }).play("BP22-066").none().cemetery()).toEqual([]);
  });

  it("067 貫く咆哮 — 7 less with イグニスドラゴン on your field; 2 to the enemy leader, draw 2", () => {
    const t = d({ me: { hand: ["BP22-067"], field: ["BP22-056"], deck: ["V1", "V3"], playPoints: 0 } }).play("BP22-067");
    expect([t.leader("opp"), t.hand()]).toEqual([18, ["V1", "V3"]]);
    expect(d({ me: { hand: ["BP22-067"], playPoints: 6 } }).canPlay("BP22-067")).toBe(false);
  });

  it("068 / 069 ヘイルドラゴン — Fanfare, discard a 7-cost-or-more Dragoncraft card: engage up to 2 enemy followers, they don't refresh next start phase; evolved: 5 damage", () => {
    const t = d({ me: { hand: ["BP22-068", "BP22-071"], deck: ["V1"], playPoints: 6 }, opp: { field: ["V5", { card: "V3", engaged: true }, "V1"], deck: ["V1", "V1"] } });
    t.play("BP22-068").yes().pick("opp:V5", "opp:V3").end();
    expect([t.engaged("opp:V5"), t.engaged("opp:V3"), t.engaged("opp:V1")]).toEqual([true, true, false]);
    const e = d({ me: { field: ["BP22-068"], evolveDeck: ["BP22-069"], playPoints: 1 }, opp: { field: ["V5", "V3"] } }).evolve("BP22-068").pick("opp:V5");
    expect(e.field("opp")).toEqual(["V3"]);
  });

  it("070 堅殻のドラゴスネーク — Rush; Last Words, pay 2: another 堅殻のドラゴスネーク from the deck onto the field", () => {
    const t = d({ me: { field: ["BP22-070"], hand: ["QUICK-SAC"], deck: ["V1", "BP22-070"], playPoints: 2 } }).play("QUICK-SAC").yes().pick("BP22-070");
    expect([t.field(), t.pp(), t.keywords("BP22-070")]).toEqual([["BP22-070"], 0, ["rush"]]);
  });

  it("071 雷龍 — Storm; Fanfare: 5 damage and draw", () => {
    const t = d({ me: { hand: ["BP22-071"], deck: ["V1"], playPoints: 7 }, opp: { field: ["V5", "V3"] } }).play("BP22-071").pick("opp:V5");
    expect([t.field("opp"), t.hand(), t.keywords("BP22-071")]).toEqual([["V3"], ["V1"], ["storm"]]);
  });

  it("072 サラマンダーブレス — 4 damage; played for 2 more, also 1 to each enemy follower", () => {
    const t = d({ me: { hand: ["BP22-072"], playPoints: 4 }, opp: { field: ["V5", "V3"] } }).play("BP22-072").choose("plus2").pick("opp:V5");
    expect([t.field("opp"), t.stats("opp:V3"), t.pp()]).toEqual([["V3"], [3, 3], 0]);
    const s = d({ me: { hand: ["BP22-072"], playPoints: 2 }, opp: { field: ["V5", "V3"] } }).play("BP22-072").pick("opp:V5");
    expect([s.stats("opp:V5"), s.stats("opp:V3")]).toEqual([[5, 1], [3, 4]]);
  });

  it("073 竜の峡谷 — a Dragoncraft follower put onto your field: damage equal to its attack; Fanfare: a Dragoncraft follower from the top 3 onto the field", () => {
    const t = d({ me: { field: ["BP22-073"], hand: ["BP22-064"], playPoints: 3 }, opp: { field: ["V5", "V3"] } }).play("BP22-064").pick("opp:V5");
    expect(t.stats("opp:V5")).toEqual([5, 2]);
    const f = d({ me: { hand: ["BP22-073"], deck: ["V1", "BP22-064", "V3"], playPoints: 8 }, opp: { field: ["V5", "V3"] } }).play("BP22-073").pick("BP22-064").order().pick("opp:V3");
    expect([f.field(), f.stats("opp:V3")]).toEqual([["BP22-073", "BP22-064"], [3, 1]]);
  });

  it("117 / 118 〔全力疾走〕オグリキャップ — 2 less per Umamusume card on your field; serve; Storm; evolved: 4 damage, super-evolved: engage X other Umamusume cards: +X/+X", () => {
    expect(d({ me: { hand: ["BP22-117"], field: ["CP01-013", "CP01-009"], playPoints: 5 } }).canPlay("BP22-117")).toBe(true);
    expect(d({ me: { hand: ["BP22-117"], field: ["CP01-013", "CP01-009"], playPoints: 4 } }).canPlay("BP22-117")).toBe(false);
    const r = d({ me: { field: ["BP22-117"], evolveDeck: [CARROT], playPoints: 1 } }).activate("BP22-117");
    expect([r.game.reader().isRacing(r.id("BP22-117")), r.keywords("BP22-117")]).toEqual([true, ["storm", "rush"]]);
    const t = d({ me: { field: ["BP22-117", "CP01-013", "CP01-009"], evolveDeck: ["BP22-118"], ...SUPER }, opp: { field: ["V5", "V3"] } });
    t.evolve("BP22-117", { sep: true }).pending().pick("opp:V5").yes().pick("CP01-013", "CP01-009");
    expect([t.stats("opp:V5"), t.stats("BP22-117"), t.engaged("CP01-013"), t.engaged("CP01-009")]).toEqual([[5, 1], [6, 6], true, true]);
  });
});
