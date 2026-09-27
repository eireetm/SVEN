import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP02 Dragoncraft (052–068), THE IDOLM@STER CINDERELLA GIRLS. V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral).
// CP02-T01 is a Magical Item (Lesson banishes them from the EX area). AMULET is a 1-cost amulet. iM@S CG followers without
// abilities besides Evolve: CP02-014 (Cute, 2c), CP02-032 (Cute, 2c), CP02-047 (Passion, 1c). CP02-045 is a 1-cost iM@S CG
// spell (2 damage), CP02-041 a 3-cost one; CP02-103 is Cute, Cool and Passion.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ITEM = "CP02-T01";
const maxPp = (t: ReturnType<typeof d>, p: 0 | 1 = 0) => t.game.state.players[p].maxPlayPoints;

describe("CP02 Dragoncraft", () => {
  it("052 Akari Tsujino — Ward; Fanfare: leader +3, 3 to the enemy leader with 10 max PP; taking 5 or more damage: max PP +1", () => {
    const t = d({ me: { hand: ["CP02-052"], playPoints: 4, maxPlayPoints: 10 } }).play("CP02-052").none();
    expect([t.leader(), t.leader("opp")]).toEqual([23, 17]);
    expect(d({ me: { hand: ["CP02-052"], playPoints: 4, maxPlayPoints: 9 } }).play("CP02-052").none().leader("opp")).toBe(20);
    // 7 damage destroys it and still counts (ruling); 2 damage doesn't.
    const big = d({ me: { field: ["CP02-052"], hand: ["CP02-062"], playPoints: 3, maxPlayPoints: 6 } }).play("CP02-062");
    expect([big.field(), maxPp(big)]).toEqual([[], 7]);
    const small = d({ me: { hand: ["CP02-045"], playPoints: 1 }, opp: { field: ["CP02-052"], maxPlayPoints: 6 } }).play("CP02-045");
    expect([small.stats("opp:CP02-052"), maxPp(small, 1)]).toEqual([[4, 3], 6]);
  });

  it("053 / 054 Yui Ohtsuki — Fanfare, Lesson (1): 4 damage; evolved: a spell or amulet costing 3 or less into the EX area, 3 less this turn", () => {
    expect(d({ me: { hand: ["CP02-053"], ex: [ITEM], playPoints: 4 }, opp: { field: ["V5"] } }).play("CP02-053").yes().stats("opp:V5")).toEqual([5, 1]);
    const e = d({ me: { field: ["CP02-053"], evolveDeck: ["CP02-054"], deck: ["V1", "CP02-041"], playPoints: 2 }, opp: { field: ["V5"] } });
    e.evolve("CP02-053").pick("CP02-041");
    expect([e.ex(), e.pp(), e.canPlay("CP02-041@ex")]).toEqual([["CP02-041"], 0, true]);
  });

  it("055 Fumika Sagisawa — Fanfare: summon a 3-cost and a 1-cost follower from the deck; another iM@S CG follower entering: 2 damage", () => {
    const t = d({ me: { hand: ["CP02-055"], deck: ["V3", "CP02-047", "V1"], playPoints: 7 }, opp: { field: ["V5", "V2"] } }).play("CP02-055");
    t.pick("V3").pick("CP02-047").pick("opp:V2");
    expect([t.field(), t.stats("opp:V2"), t.stats("opp:V5")]).toEqual([["CP02-055", "V3", "CP02-047"], [2, 1], [5, 5]]);
  });

  it("056 Akira Sunazuka — Fanfare, discard up to 3: Cute: leader +2, Cool: draw, Passion: 2 to the enemy leader; 10 max PP: draw 2", () => {
    // A card with all three types satisfies each (ruling).
    const t = d({ me: { hand: ["CP02-056", "CP02-103", "V1"], deck: ["V3", "V3", "V3"], playPoints: 2 } }).play("CP02-056").flush().yes().pick("CP02-103").flush();
    expect([t.leader(), t.hand(), t.leader("opp")]).toEqual([22, ["V1", "V3"], 18]);
    const ten = d({ me: { hand: ["CP02-056"], deck: ["V3", "V3"], playPoints: 2, maxPlayPoints: 10 } }).play("CP02-056").flush();
    expect(ten.hand()).toEqual(["V3", "V3"]);
  });

  it("057 / 058 Tsukasa Kiryu — Fanfare: max PP +1; Lesson (3) may pay for evolving; evolved: destroy, 3 to its leader with 10 max PP", () => {
    expect(maxPp(d({ me: { hand: ["CP02-057"], playPoints: 6, maxPlayPoints: 6 } }).play("CP02-057"))).toBe(7);
    const e = d({ me: { field: ["CP02-057"], evolveDeck: ["CP02-058"], ex: [ITEM, ITEM, ITEM], playPoints: 0, maxPlayPoints: 10 }, opp: { field: ["V5"] } });
    e.evolve("CP02-057");
    expect([e.field("opp"), e.leader("opp"), e.ex()]).toEqual([[], 17, []]);
    expect(d({ me: { field: ["CP02-057"], evolveDeck: ["CP02-058"], ex: [ITEM, ITEM], playPoints: 0 } }).canEvolve("CP02-057")).toBe(false);
  });

  it("059 Arisu Tachibana — Fanfare with 3 iM@S CG followers: a 1-cost spell or amulet from the deck", () => {
    const t = d({ me: { hand: ["CP02-059"], field: ["CP02-014", "CP02-032"], deck: ["V1", "CP02-045"], playPoints: 1 } }).play("CP02-059").pick("CP02-045");
    expect(t.hand()).toEqual(["CP02-045"]);
  });

  it("060 / 061 Yuka Nakano — evolved: 1 to each enemy follower, 4 with 10 max PP", () => {
    const e = (max: number) =>
      d({ me: { field: ["CP02-060"], evolveDeck: ["CP02-061"], playPoints: 2, maxPlayPoints: max }, opp: { field: ["V5", "V1"] } }).evolve("CP02-060");
    expect([e(10).field("opp"), e(10).stats("opp:V5"), e(9).stats("opp:V5")]).toEqual([["V5"], [5, 1], [5, 4]]);
  });

  it("062 Unbound Emotion — 1 more per follower on the field; 7 damage to each follower; a cost set to 0 still gets +X", () => {
    expect(d({ me: { hand: ["CP02-062"], field: ["V1"], playPoints: 4 }, opp: { field: ["V5", "V3"] } }).canPlay("CP02-062")).toBe(false);
    const t = d({ me: { hand: ["CP02-062"], field: ["V1"], playPoints: 5 }, opp: { field: ["V5", "V3"] } }).play("CP02-062");
    expect([t.field(), t.field("opp"), t.pp()]).toEqual([[], [], 0]);
    // Played for 0 by CP02-043 (CR 10.10.2.4 — ruling): 0 + 3 followers.
    const hina = (pp: number) =>
      d({ me: { field: ["CP02-042", "V1"], evolveDeck: ["CP02-043"], cemetery: ["CP02-062"], playPoints: pp }, opp: { field: ["V5"] } }).evolve("CP02-042");
    const poor = hina(3);
    expect([poor.field("opp"), poor.cemetery(), poor.pp()]).toEqual([["V5"], ["CP02-062"], 2]);
    const rich = hina(4);
    expect([rich.field(), rich.field("opp"), rich.pp()]).toEqual([[], [], 0]);
  });

  it("063 Tokiko Zaizen — Fanfare: damage to the enemy leader equal to your other iM@S CG followers", () => {
    expect(d({ me: { hand: ["CP02-063"], field: ["CP02-014", "CP02-032", "V1"], playPoints: 3 } }).play("CP02-063").leader("opp")).toBe(18);
  });

  it("064 Noriko Shiina — Fanfare with 3 iM@S CG followers: +1/+0 and Rush; Strike: leader +2", () => {
    const t = d({ me: { hand: ["CP02-064"], field: ["CP02-014", "CP02-032"], playPoints: 2 } }).play("CP02-064");
    expect([t.stats("CP02-064"), t.keywords("CP02-064")]).toEqual([[3, 3], ["rush"]]);
    expect(d({ me: { field: ["CP02-064"] } }).attack("CP02-064", "opp:leader").leader()).toBe(22);
  });

  it("065 Yukari Mizumoto — Fanfare: destroy an enemy amulet, or draw", () => {
    expect(d({ me: { hand: ["CP02-065"], deck: ["V1"], playPoints: 4 }, opp: { field: ["AMULET"] } }).play("CP02-065").choose("1").field("opp")).toEqual([]);
    expect(d({ me: { hand: ["CP02-065"], deck: ["V1"], playPoints: 4 } }).play("CP02-065").hand()).toEqual(["V1"]);
  });

  it("066 / 067 Noa Takamine — evolved: damage equal to your max PP", () => {
    const e = d({ me: { field: ["CP02-066"], evolveDeck: ["CP02-067"], playPoints: 1, maxPlayPoints: 4 }, opp: { field: ["V5"] } }).evolve("CP02-066");
    expect(e.stats("opp:V5")).toEqual([5, 1]);
  });

  it("068 Mode Estivale — draw 3", () => {
    expect(d({ me: { hand: ["CP02-068"], deck: ["V1", "V1", "V1"], playPoints: 4 } }).play("CP02-068").hand().length).toBe(3);
  });
});
