import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP22 Runecraft (037–055). Pre-release cards with Japanese names (data/preview.ts). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c
// 5/5 (Neutral). BP01-T10 Magic Sediment (Stack), BP01-T08 Strikeform Golem / BP01-T09 Guardform Golem (2c tokens, Ward on the
// latter), BP05-T04 Ancient Artifact, BP13-T05 Keenedge Artifact, BP22-T03 レディアントアーティファクト.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const SEDIMENT = "BP01-T10";
const STRIKEFORM = "BP01-T08";
const GUARDFORM = "BP01-T09";

describe("BP22 Runecraft", () => {
  it("037 / 038 クロノウィッチ — during your turn a card put into your banished zone: 1 damage; Fanfare with 10 banished: the next Runecraft follower evolves; evolved: up to 2 Runecraft followers (total 4) from the banished zone into the EX area for 0", () => {
    const t = d({ me: { field: ["BP22-037"], hand: ["BP22-046"], deck: ["V1", "V3"], playPoints: 2 }, opp: { field: ["V5", "V3"] } });
    t.play("BP22-046").pick("opp:V5");
    expect([t.zone("me", "banished"), t.stats("opp:V5")]).toEqual([["V1"], [5, 4]]);
    const f = d({ me: { hand: ["BP22-037", "BP22-046"], banished: n(10, "V1"), evolveDeck: ["BP22-047"], deck: ["V3"], playPoints: 7 } });
    f.play("BP22-037").play("BP22-046").pending("BP22-037").yes().flush();
    expect([f.stats("BP22-046"), f.field()]).toEqual([[3, 3], ["BP22-037", "BP22-046", "BP13-T05"]]);
    const few = d({ me: { hand: ["BP22-037", "BP22-046"], banished: n(9, "V1"), evolveDeck: ["BP22-047"], deck: ["V3"], playPoints: 7 } });
    expect(few.play("BP22-037").play("BP22-046").stats("BP22-046")).toEqual([2, 2]);
    const e = d({ me: { field: ["BP22-037"], evolveDeck: ["BP22-038"], banished: ["BP22-046", "BP22-042", "BP22-050", "V1"], playPoints: 1 } });
    e.evolve("BP22-037").pick("BP22-046").pick("BP22-042");
    expect([e.ex(), e.pp(), e.canPlay("BP22-046@ex"), e.canPlay("BP22-042@ex")]).toEqual([["BP22-046", "BP22-042"], 0, true, true]);
  });

  it("039 プレデターゴーレム — Ward; Earth Rite (9) when playing: costs 1; Fanfare: destroy up to 3, 3 to the enemy leader, leader +3", () => {
    const t = d({ me: { hand: ["BP22-039"], field: [{ card: SEDIMENT, counters: { stack: 9 } }], leaderDefense: 10, playPoints: 1 }, opp: { field: ["V5", "V3", "V1"] } });
    t.play("BP22-039").none().pick("opp:V5", "opp:V3");
    expect([t.field(), t.field("opp"), t.leader("opp"), t.leader(), t.pp()]).toEqual([["BP22-039"], ["V1"], 17, 13, 0]);
    expect(d({ me: { hand: ["BP22-039"], field: [{ card: SEDIMENT, counters: { stack: 8 } }], playPoints: 1 } }).canPlay("BP22-039")).toBe(false);
    const none = d({ me: { hand: ["BP22-039"], playPoints: 9 } }).play("BP22-039").none();
    expect([none.leader("opp"), none.leader()]).toEqual([17, 23]);
  });

  it("040 / 041 巡りの大魔術師・レヴィ — Fanfare, Earth Rite: 5 damage; evolved: 3 to an enemy leader or follower, and act (1), Earth Rite: the same once per turn", () => {
    const t = d({ me: { hand: ["BP22-040"], field: [{ card: SEDIMENT, counters: { stack: 2 } }], playPoints: 4 }, opp: { field: ["V5", "V3"] } });
    t.play("BP22-040").yes().pick("opp:V5");
    expect([t.field("opp"), t.counters(SEDIMENT, "stack")]).toEqual([["V3"], 1]);
    const e = d({ me: { field: ["BP22-040", { card: SEDIMENT, counters: { stack: 2 } }], evolveDeck: ["BP22-041"], playPoints: 3 }, opp: { field: ["V5"] } });
    e.evolve("BP22-040").pick("opp:leader").activate("BP22-040").pick("opp:leader");
    expect([e.leader("opp"), e.counters(SEDIMENT, "stack"), e.canActivate("BP22-040")]).toEqual([14, 1, false]);
  });

  it("042 / 043 マジカルキャット — Fanfare, banish 2 Runecraft cards from the cemetery: evolves; evolved: Assail, draw", () => {
    const t = d({ me: { hand: ["BP22-042"], cemetery: ["BP22-046", "BP22-050", "V1"], evolveDeck: ["BP22-043"], deck: ["V3"], playPoints: 2 } });
    t.play("BP22-042").yes().yes();
    expect([t.stats("BP22-042"), t.keywords("BP22-042"), t.hand(), t.cemetery(), t.pp()]).toEqual([[3, 2], ["assail"], ["V3"], ["V1"], 0]);
  });

  it("044 グレートマジシャン — Fanfare: Stack +1 (a Magic Sediment); act, engage, Earth Rite (3): Stack +6", () => {
    const t = d({ me: { hand: ["BP22-044"], playPoints: 2 } }).play("BP22-044");
    expect([t.field(), t.counters(SEDIMENT, "stack")]).toEqual([["BP22-044", SEDIMENT], 1]);
    const a = d({ me: { field: ["BP22-044", { card: SEDIMENT, counters: { stack: 4 } }] } }).activate("BP22-044");
    expect([a.counters(SEDIMENT, "stack"), a.engaged("BP22-044")]).toEqual([7, true]);
    const empty = d({ me: { field: ["BP22-044", { card: SEDIMENT, counters: { stack: 3 } }] } }).activate("BP22-044");
    expect(empty.counters(SEDIMENT, "stack")).toBe(6);
    expect(d({ me: { field: ["BP22-044", { card: SEDIMENT, counters: { stack: 2 } }] } }).canActivate("BP22-044")).toBe(false);
  });

  it("045 界門のホムンクルス・ラズリ — Fanfare: banish the top 2; act (2), engage, with 10 banished: an Ancient Artifact and a レディアントアーティファクト (choose with one slot)", () => {
    expect(d({ me: { hand: ["BP22-045"], deck: ["V1", "V3", "V5"], playPoints: 2 } }).play("BP22-045").zone("me", "banished")).toEqual(["V1", "V3"]);
    const t = d({ me: { field: ["BP22-045"], banished: n(10, "V1"), playPoints: 2 } }).activate("BP22-045");
    expect([t.field(), t.keywords("BP22-T03")]).toEqual([["BP22-045", "BP05-T04", "BP22-T03"], ["storm"]]);
    const one = d({ me: { field: ["BP22-045", "V1", "V1", "V1"], banished: n(10, "V1"), playPoints: 2 } }).activate("BP22-045").choose("レディアントアーティファクト");
    expect(one.field()).toEqual(["BP22-045", "V1", "V1", "V1", "BP22-T03"]);
    expect(d({ me: { field: ["BP22-045"], banished: n(9, "V1"), playPoints: 2 } }).canActivate("BP22-045")).toBe(false);
  });

  it("046 / 047 フェイクウィング・エリーナ — Fanfare: banish the top card; evolved: an Ancient Artifact, a Keenedge Artifact with 10 banished", () => {
    expect(d({ me: { hand: ["BP22-046"], deck: ["V1", "V3"], playPoints: 2 } }).play("BP22-046").zone("me", "banished")).toEqual(["V1"]);
    expect(d({ me: { field: ["BP22-046"], evolveDeck: ["BP22-047"], playPoints: 1 } }).evolve("BP22-046").field()).toEqual(["BP22-046", "BP05-T04"]);
    const t = d({ me: { field: ["BP22-046"], evolveDeck: ["BP22-047"], banished: n(10, "V1"), playPoints: 1 } }).evolve("BP22-046");
    expect(t.field()).toEqual(["BP22-046", "BP13-T05"]);
  });

  it("048 アンブレラウィッチ — Fanfare: with 6 different costs in the cemetery, 3 damage, leader +3, recover 3", () => {
    const six = ["V1", "V2", "V3", "V5", "BP22-050", "BP22-039"];
    const t = d({ me: { hand: ["BP22-048"], cemetery: six, leaderDefense: 10, playPoints: 4, maxPlayPoints: 6 }, opp: { field: ["V5", "V3"] } }).play("BP22-048").pick("opp:V5");
    expect([t.stats("opp:V5"), t.leader(), t.pp()]).toEqual([[5, 2], 13, 3]);
    const five = d({ me: { hand: ["BP22-048"], cemetery: six.slice(1), leaderDefense: 10, playPoints: 4, maxPlayPoints: 6 }, opp: { field: ["V5", "V3"] } });
    expect(five.play("BP22-048").pick("opp:V5").stats("opp:V5")).toEqual([5, 5]);
  });

  it("049 暗獄の遣い・ジャスパー — a Golem follower entering: 2 damage and 1 to its leader; Fanfare: a Strikeform Golem; act (3): Golem cards from your EX area cost 3 less this turn", () => {
    expect(d({ me: { hand: ["BP22-049"], playPoints: 3 } }).play("BP22-049").ex()).toEqual([STRIKEFORM]);
    const t = d({ me: { field: ["BP22-049"], ex: [STRIKEFORM, GUARDFORM], playPoints: 3 }, opp: { field: ["V5", "V3"] } }).activate("BP22-049");
    t.play(`${STRIKEFORM}@ex`).pick("opp:V5").play(`${GUARDFORM}@ex`).none().pick("opp:V5");
    expect([t.field(), t.stats("opp:V5"), t.leader("opp"), t.pp()]).toEqual([["BP22-049", STRIKEFORM, GUARDFORM], [5, 1], 18, 0]);
  });

  it("050 / 051 刃の魔術師 — 6 less with 6 different costs in the cemetery; Fanfare: 2 damage; evolved: Storm", () => {
    const six = ["V1", "V2", "V3", "V5", "BP22-050", "BP22-039"];
    const t = d({ me: { hand: ["BP22-050"], cemetery: six, playPoints: 0 }, opp: { field: ["V5", "V3"] } }).play("BP22-050").pick("opp:V5");
    expect(t.stats("opp:V5")).toEqual([5, 3]);
    expect(d({ me: { hand: ["BP22-050"], cemetery: six.slice(1), playPoints: 5 } }).canPlay("BP22-050")).toBe(false);
    expect(d({ me: { field: ["BP22-050"], evolveDeck: ["BP22-051"], playPoints: 3 } }).evolve("BP22-050").keywords("BP22-050")).toEqual(["storm"]);
  });

  it("052 氷塊のゴーレム — Fanfare: a Golem follower not named 氷塊のゴーレム from the deck onto the field", () => {
    const t = d({ me: { hand: ["BP22-052"], deck: ["BP22-052", "V1", "BP22-053"], playPoints: 8 } }).play("BP22-052").pick("BP22-053");
    expect(t.field()).toEqual(["BP22-052", "BP22-053"]);
  });

  it("053 氷結の魔獣 — Rush; Strike: a Strikeform Golem; Fanfare: engage up to 2 enemy followers", () => {
    const t = d({ me: { hand: ["BP22-053"], playPoints: 4 }, opp: { field: ["V5", "V3", "V1"] } }).play("BP22-053").pick("opp:V5", "opp:V3");
    expect([t.engaged("opp:V5"), t.engaged("opp:V3"), t.engaged("opp:V1"), t.keywords("BP22-053")]).toEqual([true, true, false, ["rush"]]);
    t.attack("BP22-053", "opp:V3");
    expect(t.field()).toEqual(["BP22-053", STRIKEFORM]);
  });

  it("054 ゴーレムアサルト — a Guardform and a Strikeform Golem into the EX area (choose with one slot); Earth Rite: +1/+1 to the Golem followers there", () => {
    const t = d({ me: { hand: ["BP22-054"], field: [SEDIMENT], ex: [STRIKEFORM], playPoints: 1 } }).play("BP22-054").yes();
    expect([t.ex(), t.stats(`${STRIKEFORM}@ex`), t.stats(`${GUARDFORM}@ex`), t.field()]).toEqual([[STRIKEFORM, GUARDFORM, STRIKEFORM], [4, 3], [3, 4], []]);
    const one = d({ me: { hand: ["BP22-054"], ex: ["V1", "V1", "V1", "V1"], playPoints: 1 } }).play("BP22-054").choose("Guardform Golem");
    expect([one.ex(), one.stats(`${GUARDFORM}@ex`)]).toEqual([["V1", "V1", "V1", "V1", GUARDFORM], [2, 3]]);
  });

  it("055 鏡像の召喚 — another token follower of the same name as a 5-cost-or-less token follower of yours", () => {
    const t = d({ me: { hand: ["BP22-055"], field: [STRIKEFORM, "V1"], playPoints: 2 } }).play("BP22-055");
    expect(t.field()).toEqual([STRIKEFORM, "V1", STRIKEFORM]);
    expect(d({ me: { hand: ["BP22-055"], field: ["V1"], playPoints: 2 } }).canPlay("BP22-055")).toBe(false);
  });
});
