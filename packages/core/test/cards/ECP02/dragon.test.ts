import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// ECP02 Dragoncraft (037–046), THE IDOLM@STER CINDERELLA GIRLS. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP02-T01 is a Magical Item
// (Lesson banishes them from the EX area). iM@S CG followers with only Evolve: CP02-014 Kana Imai / CP02-060 Yuka Nakano (Cute, 2c /
// 1c), CP02-042 Hina Araki / CP02-039 Kanade Hayami (Cool, 2c / 3c), CP02-047 Rika Jougasaki (Passion, 1c). CP02-103 New
// Generations has all three types. CP02-028 Sparkling☆Days is a 1-cost Cool spell.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ITEM = "CP02-T01";
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };

describe("ECP02 Dragoncraft", () => {
  it("037 / 038 Fumika Sagisawa — Fanfare with 3 Cool followers: 1 damage to the enemy leader; evolved: 2 damage, or (4), bury this: a Fumika Sagisawa", () => {
    expect(d({ me: { hand: ["ECP02-037"], field: ["CP02-042", "CP02-039"], playPoints: 2 } }).play("ECP02-037").leader("opp")).toBe(19);
    const e = d({ me: { field: ["ECP02-037"], evolveDeck: ["ECP02-038"], deck: ["V1", "ECP02-037"], playPoints: 5 }, opp: { field: ["V5"] } });
    e.evolve("ECP02-037").choose("search").yes().pick("ECP02-037");
    expect([e.field(), e.stats("ECP02-037"), e.pp(), e.stats("opp:V5")]).toEqual([["ECP02-037"], [2, 2], 0, [5, 5]]);
  });

  it("039 Akira Sunazuka — Fanfare, Lesson (1): an iM@S CG card from the top 3; act, engage, discard a Cute, Cool and Passion card: leader +3, draw 3, recover 3", () => {
    const t = d({ me: { hand: ["ECP02-039"], ex: [ITEM], deck: ["V1", "CP02-042", "V3"], playPoints: 5 } }).play("ECP02-039").yes().pick("CP02-042").order();
    expect(t.hand()).toEqual(["CP02-042"]);
    const a = d({ me: { field: ["ECP02-039"], hand: ["CP02-014", "CP02-042", "CP02-047", "V1"], deck: ["V1", "V3", "V5"], playPoints: 0, maxPlayPoints: 5 } });
    a.activate("ECP02-039");
    expect([a.leader(), a.hand().sort(), a.pp()]).toEqual([23, ["V1", "V1", "V3", "V5"], 3]);
    // 3 different cards: New Generations alone can't pay it (ruling).
    expect(d({ me: { field: ["ECP02-039"], hand: ["CP02-103", "CP02-014"] } }).canActivate("ECP02-039")).toBe(false);
    expect(d({ me: { field: ["ECP02-039"], hand: ["CP02-103", "CP02-014", "CP02-042"] } }).canActivate("ECP02-039")).toBe(true);
  });

  it("040 Akari Tsujino — Rush; Fanfare: bury the top 3; Cute: leader +2, Cool: Assail, Passion: +2/+0 (a card with all three types meets each)", () => {
    const t = d({ me: { hand: ["ECP02-040"], deck: ["CP02-103", "V1", "V3"], playPoints: 3 } }).play("ECP02-040");
    expect([t.leader(), t.keywords("ECP02-040"), t.stats("ECP02-040")]).toEqual([22, ["rush", "assail"], [5, 3]]);
    const c = d({ me: { hand: ["ECP02-040"], deck: ["CP02-014", "CP02-060", "V3"], playPoints: 3 } }).play("ECP02-040");
    expect([c.leader(), c.keywords("ECP02-040"), c.stats("ECP02-040")]).toEqual([22, ["rush"], [3, 3]]);
  });

  it("041 Riamu Yumemi [Party Night] — Fanfare: 7 damage to each enemy follower, Storm and recover 1 with 3 of each type; Quick act from the hand: 2 damage", () => {
    const t = d({ me: { hand: ["ECP02-041"], cemetery: Array<string>(3).fill("CP02-103"), playPoints: 8, maxPlayPoints: 8 }, opp: { field: ["V5", "V3"] } }).play("ECP02-041");
    expect([t.field("opp"), t.keywords("ECP02-041"), t.pp()]).toEqual([[], ["storm"], 1]);
    const q = d({ me: { hand: ["ECP02-041"], ex: [ITEM], playPoints: 1 }, opp: { field: ["V5"] } }).activate("ECP02-041");
    expect([q.stats("opp:V5"), q.cemetery(), q.ex(), q.pp()]).toEqual([[5, 3], ["ECP02-041"], [], 0]);
  });

  it("042 / 043 Yui Ohtsuki — evolved: a Passion card from the top 2, or (3), bury this: a Yui Ohtsuki from the deck, evolved", () => {
    const e = d({ me: { field: ["ECP02-042"], evolveDeck: ["ECP02-043", "ECP02-043"], deck: ["V1", "ECP02-042"], playPoints: 4 } });
    e.evolve("ECP02-042").choose("search").yes().pick("ECP02-042").yes().choose("look");
    expect([e.field(), e.stats("ECP02-042"), e.pp(), e.cemetery()]).toEqual([["ECP02-042"], [2, 2], 0, ["ECP02-042"]]);
    const l = d({ me: { field: ["ECP02-042"], evolveDeck: ["ECP02-043"], deck: ["V1", "CP02-047"], playPoints: 1 } }).evolve("ECP02-042").choose("look").pick("CP02-047");
    expect(l.hand()).toEqual(["CP02-047"]);
  });

  it("044 / 045 Hotaru Shiragiku — end phase: a follower +0/+2 with 5 Cute cards in the cemetery; evolved: an iM@S CG follower with 1 attack from the deck", () => {
    expect(d({ me: { field: ["ECP02-044"], cemetery: Array<string>(5).fill("CP02-014") }, opp: { deck: ["V1"] } }).end().stats("ECP02-044")).toEqual([2, 4]);
    expect(d({ me: { field: ["ECP02-044"], evolveDeck: ["ECP02-045"], deck: ["V1", "CP02-047"], playPoints: 1 } }).evolve("ECP02-044").pick("CP02-047").hand()).toEqual(["CP02-047"]);
  });

  it("046 Star of the Show — may pay 3 more; destroy an enemy follower, and with the 3 more a Tsukasa Kiryu from the deck", () => {
    const t = d({ me: { hand: ["ECP02-046"], deck: ["V1", "CP02-057"], playPoints: 6, maxPlayPoints: 6 }, opp: { field: ["V5"] } }).play("ECP02-046").choose("plus3").pick("CP02-057");
    expect([t.field(), t.field("opp"), t.pp()]).toEqual([["CP02-057"], [], 0]);
    const n = d({ me: { hand: ["ECP02-046"], deck: ["V1", "CP02-057"], playPoints: 3 }, opp: { field: ["V5"] } }).play("ECP02-046");
    expect([n.field(), n.field("opp")]).toEqual([[], []]);
  });
});
