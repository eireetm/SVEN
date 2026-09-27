import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP01 Forestcraft (001–013), Umamusume. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP01-085 Carrot (evolve deck) is what
// serving ({[feed]}) uses; a field card `{ card, racing: 1 }` is already racing. BP20-070 (act 0, once per turn: 1 damage
// to a follower of yours).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const CARROT = "CP01-085";

describe("CP01 Forestcraft", () => {
  it("001 / 002 Silence Suzuka — Storm; serve (1): race; evolved: an enemy follower on top of its owner's deck", () => {
    const t = d({ me: { field: ["CP01-001"], evolveDeck: [CARROT], playPoints: 1 } }).activate("CP01-001");
    expect([t.game.reader().isRacing(t.id("CP01-001")), t.keywords("CP01-001").includes("storm")]).toEqual([true, true]);
    const e = d({ me: { field: ["CP01-001"], evolveDeck: ["CP01-002"], playPoints: 2 }, opp: { field: ["V5"], deck: ["V1"] } }).evolve("CP01-001");
    expect([e.field("opp"), e.zone("opp", "deck")]).toEqual([[], ["V5", "V1"]]);
  });

  it("003 Smart Falcon — Fanfare, return any number of other Umamusume cards: 2x as much damage to each enemy follower", () => {
    const t = d({ me: { hand: ["CP01-003"], field: ["CP01-006", "CP01-009"], playPoints: 5 }, opp: { field: ["V5", "V3"] } }).play("CP01-003").yes();
    t.pick("CP01-006", "CP01-009");
    expect([t.field("opp"), t.stats("opp:V5"), t.hand()]).toEqual([["V5"], [5, 1], ["CP01-006", "CP01-009"]]);
  });

  it("004 Gold City — Storm while at least 8 cards are on the field; Fanfare: recover 3 play points", () => {
    expect(d({ me: { field: ["CP01-004", "V1", "V1", "V1"] }, opp: { field: ["V1", "V1", "V1", "V1"] } }).keywords("CP01-004")).toEqual(["storm"]);
    expect(d({ me: { field: ["CP01-004", "V1", "V1"] }, opp: { field: ["V1", "V1", "V1", "V1"] } }).keywords("CP01-004")).toEqual([]);
    expect(d({ me: { hand: ["CP01-004"], playPoints: 4, maxPlayPoints: 5 } }).play("CP01-004").pp()).toBe(3);
  });

  it("005 Eat Fast! Yum Fast! — a follower with Storm from the deck, or +3/+0 to one on your field", () => {
    const t = d({ me: { hand: ["CP01-005"], deck: ["V1", "CP01-001"], playPoints: 2 } }).play("CP01-005").pick("CP01-001"); // (2) has no target
    expect(t.hand()).toEqual(["CP01-001"]);
    expect(d({ me: { hand: ["CP01-005"], field: ["CP01-001"], deck: ["V1"], playPoints: 2 } }).play("CP01-005").choose("attack").stats("CP01-001")).toEqual([7, 1]);
  });

  it("006 Shinko Windy — Fanfare: look at the top card, may put it on the bottom", () => {
    expect(d({ me: { hand: ["CP01-006"], deck: ["V1", "V3"], playPoints: 1 } }).play("CP01-006").yes().zone("me", "deck")).toEqual(["V3", "V1"]);
  });

  it("007 Eishin Flash — On Race: +1/+1, return up to 1 enemy follower", () => {
    const t = d({ me: { field: ["CP01-007"], evolveDeck: [CARROT], playPoints: 1 }, opp: { field: ["V5"] } }).activate("CP01-007").pick("opp:V5");
    expect([t.stats("CP01-007"), t.hand("opp")]).toEqual([[4, 4], ["V5"]]);
  });

  it("008 Systematic Squats / 009 Marvelous Sunday — returned to hand: +1/+1 to an Umamusume follower; Fanfare, return another card: leader +2", () => {
    const t = d({ me: { hand: ["CP01-009"], field: ["CP01-008"], playPoints: 2 } }).play("CP01-009").yes();
    expect([t.hand(), t.leader(), t.stats("CP01-009")]).toEqual([["CP01-008"], 22, [3, 4]]);
    expect(d({ me: { hand: ["CP01-008"], deck: ["V1"], playPoints: 2 } }).play("CP01-008").hand()).toEqual(["V1"]);
  });

  it("010 Yukino Bijin — Ward; Fanfare, return another card: +1/+1", () => {
    const t = d({ me: { hand: ["CP01-010"], field: ["V1"], playPoints: 3 } }).play("CP01-010").none().yes();
    expect([t.stats("CP01-010"), t.hand()]).toEqual([[4, 4], ["V1"]]);
  });

  it("011 Ines Fujin / 012 Taiki Shuttle — Fanfare: return another card on your field; returned to hand: 2 damage", () => {
    const t = d({ me: { hand: ["CP01-011"], field: ["CP01-012"], playPoints: 6 }, opp: { field: ["V5"] } }).play("CP01-011");
    expect([t.hand(), t.stats("opp:V5"), t.keywords("CP01-011")]).toEqual([["CP01-012"], [5, 3], ["rush", "assail"]]);
  });

  it("013 Haru Urara — On Race: +1/+1 and no damage this turn", () => {
    const t = d({ me: { field: ["CP01-013", "BP20-070"], evolveDeck: [CARROT], playPoints: 1 } }).activate("CP01-013").activate("BP20-070").pick("CP01-013");
    expect(t.stats("CP01-013")).toEqual([3, 3]);
  });
});
