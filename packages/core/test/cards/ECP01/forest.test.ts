import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// ECP01 Forestcraft (001–009), Umamusume. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). CP01-085 Carrot (evolve deck) is what serving
// ({[feed]}) uses; faceup ones are used Carrots. Umamusume followers without Fanfare: CP01-061 Curren Chan (1c 1/1), CP01-023
// Narita Taishin (2c 3/2, BNW), CP01-022 Sirius Symboli (4c 4/4). CP01-021 / 034 / 047 are 1-cost Umamusume spells.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const CARROT = "CP01-085";

describe("ECP01 Forestcraft", () => {
  it("001 / 002 Hokko Tarumae — costs 1 less per Umamusume card on your field; evolved: draw a card", () => {
    const t = d({ me: { hand: ["ECP01-001"], field: ["CP01-061", "CP01-023"], playPoints: 2 } }).play("ECP01-001");
    expect([t.field(), t.pp()]).toEqual([["CP01-061", "CP01-023", "ECP01-001"], 0]);
    expect(d({ me: { field: ["ECP01-001"], evolveDeck: ["ECP01-002"], deck: ["V1"], playPoints: 1 } }).evolve("ECP01-001").hand()).toEqual(["V1"]);
  });

  it("003 Sakura Laurel — Fanfare: 4 damage with another Umamusume card; act with 5 Umamusume cards: +2/+2, Ward, leader +2", () => {
    expect(d({ me: { hand: ["ECP01-003"], field: ["CP01-061"], playPoints: 3 }, opp: { field: ["V5"] } }).play("ECP01-003").stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { hand: ["ECP01-003"], playPoints: 3 }, opp: { field: ["V5"] } }).play("ECP01-003").stats("opp:V5")).toEqual([5, 5]);
    const a = d({ me: { field: ["ECP01-003", "CP01-061", "CP01-061", "CP01-023", "CP01-022"] } }).activate("ECP01-003");
    expect([a.stats("ECP01-003"), a.keywords("ECP01-003"), a.leader()]).toEqual([[4, 4], ["ward"], 22]);
    expect(d({ me: { field: ["ECP01-003", "CP01-061", "CP01-061", "CP01-023"] } }).canActivate("ECP01-003")).toBe(false);
  });

  it("004 Sounds of Earth — costs 2 less per Umamusume card; Fanfare, return another Umamusume card: 5 damage", () => {
    const t = d({ me: { hand: ["ECP01-004"], field: ["CP01-061", "CP01-061", "CP01-061"], playPoints: 3 }, opp: { field: ["V5"] } });
    t.play("ECP01-004").yes().pick("CP01-061");
    expect([t.hand(), t.field("opp"), t.pp()]).toEqual([["CP01-061"], [], 0]);
    // Without an enemy follower the Fanfare can't be played, so nothing is returned (ruling).
    const n = d({ me: { hand: ["ECP01-004"], field: ["CP01-061", "CP01-061", "CP01-061"], playPoints: 3 } }).play("ECP01-004");
    expect(n.hand()).toEqual([]);
  });

  it("005 Haru Urara — On Race: +1/+1, may summon an Umamusume follower costing 2 or less from the top 5", () => {
    const t = d({ me: { field: ["ECP01-005"], evolveDeck: [CARROT], deck: ["V1", "CP01-061", "V3", "V5", "V1"], playPoints: 1 } });
    t.activate("ECP01-005").pick("CP01-061").order();
    expect([t.stats("ECP01-005"), t.field(), t.keywords("ECP01-005")]).toEqual([[2, 2], ["ECP01-005", "CP01-061"], ["rush"]]);
  });

  it("006 Yamanin Zephyr — Fanfare: choose one; up to 2 when an Umamusume card's ability put it onto the field", () => {
    const t = d({ me: { hand: ["ECP01-006"], deck: ["CP01-061"], playPoints: 4 }, opp: { field: ["V5"] } }).play("ECP01-006").none();
    expect(t.game.decision?.type === "choose" && t.game.decision.max).toBe(1);
    t.choose("return");
    expect(t.hand("opp")).toEqual(["V5"]);
    // Teio-Oo-Oo!!! (an Umamusume spell) summons it: both options (ruling).
    const s = d({ me: { hand: ["ECP01-018"], deck: ["ECP01-006", "CP01-061"], playPoints: 5 }, opp: { field: ["V5"] } });
    s.play("ECP01-018").pick("ECP01-006").none().choose("return", "search").pick("CP01-061");
    expect([s.hand("opp"), s.field()]).toEqual([["V5"], ["ECP01-006", "CP01-061"]]);
  });

  it("007 Sakura Bakushin O — Strike: with 3 or 4 Umamusume cards draw, then discard; with 5 draw", () => {
    const t = d({ me: { field: ["ECP01-007", "CP01-061", "CP01-061"], hand: ["V1"], deck: ["V3"] } }).attack("ECP01-007", "opp:leader").pick("V1");
    expect([t.hand(), t.cemetery(), t.leader("opp")]).toEqual([["V3"], ["V1"], 19]);
    const five = d({ me: { field: ["ECP01-007", "CP01-061", "CP01-061", "CP01-061", "CP01-061"], deck: ["V3"] } }).attack("ECP01-007", "opp:leader");
    expect(five.hand()).toEqual(["V3"]);
  });

  it("008 Mihono Bourbon — serving 2 times races twice: On Race (3 damage to up to 1 enemy follower, +1/+1) twice", () => {
    const t = d({ me: { field: ["ECP01-008"], evolveDeck: [CARROT, CARROT], playPoints: 2 }, opp: { field: ["V5", "V3"] } }).activate("ECP01-008", 1);
    t.pending().pick("opp:V3").pick("opp:V5");
    expect([t.stats("opp:V3"), t.stats("opp:V5"), t.stats("ECP01-008"), t.game.reader().racedTimes(t.id("ECP01-008"))]).toEqual([[3, 1], [5, 2], [5, 5], 2]);
    // Racing, it can't serve again (ruling).
    expect(t.canActivate("ECP01-008")).toBe(false);
  });

  it("009 A MORE MARVELOUS WORLD! ☆ — Fanfare: may take the top card if it's Umamusume; act (2), engage, bury: leader +2", () => {
    expect(d({ me: { hand: ["ECP01-009"], deck: ["CP01-061"], playPoints: 1 } }).play("ECP01-009").pick("CP01-061").hand()).toEqual(["CP01-061"]);
    const a = d({ me: { field: ["ECP01-009"], playPoints: 2 } }).activate("ECP01-009");
    expect([a.field(), a.cemetery(), a.leader()]).toEqual([[], ["ECP01-009"], 22]);
  });
});
