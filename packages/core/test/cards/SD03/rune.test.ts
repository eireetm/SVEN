import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// SD03 (Runecraft starter deck). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). SD03-005 Insight (a 1-cost spell) fills cemeteries for
// Spellchain. Tokens: BP01-T08 Strikeform Golem, BP01-T09 Guardform Golem.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const INSIGHT = "SD03-005";

describe("SD03 Runecraft", () => {
  it("001 Mythril Golem — Fanfare: 3 damage to each enemy follower; Spellchain (7): 5; SC (15): 5 to the leader too", () => {
    expect(d({ me: { hand: ["SD03-001"], playPoints: 6 }, opp: { field: ["V5"] } }).play("SD03-001").stats("opp:V5")).toEqual([5, 2]);
    const t = d({ me: { hand: ["SD03-001"], cemetery: n(7, INSIGHT), playPoints: 6 }, opp: { field: ["V5"] } }).play("SD03-001");
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 20]);
    expect(d({ me: { hand: ["SD03-001"], cemetery: n(15, INSIGHT), playPoints: 6 } }).play("SD03-001").leader("opp")).toBe(15);
  });

  it("002 Rune Blade Summoner — Fanfare, Spellchain (5): +4/+4; SC (10): Storm", () => {
    expect(d({ me: { hand: ["SD03-002"], cemetery: n(5, INSIGHT), playPoints: 3 } }).play("SD03-002").stats("SD03-002")).toEqual([5, 5]);
    const t = d({ me: { hand: ["SD03-002"], cemetery: n(10, INSIGHT), playPoints: 3 } }).play("SD03-002");
    expect([t.stats("SD03-002"), t.keywords("SD03-002")]).toEqual([[5, 5], ["storm"]]);
    expect(d({ me: { hand: ["SD03-002"], cemetery: n(4, INSIGHT), playPoints: 3 } }).play("SD03-002").stats("SD03-002")).toEqual([1, 1]);
  });

  it("003 / 004 Demonflame Mage — evolved: 2 damage to each enemy follower", () => {
    const t = d({ me: { field: ["SD03-003"], evolveDeck: ["SD03-004"], playPoints: 1 }, opp: { field: ["V5", "V1"] } }).evolve("SD03-003");
    expect([t.stats("opp:V5"), t.field("opp")]).toEqual([[5, 3], ["V5"]]);
  });

  it("005 Insight — Quick: draw a card", () => {
    expect(d({ me: { hand: [INSIGHT], deck: ["V1"], playPoints: 1 } }).play(INSIGHT).hand()).toEqual(["V1"]);
  });

  it("006 Fire Chain — Quick: 3 damage divided between up to 2 enemy followers (0 may be selected)", () => {
    const t = d({ me: { hand: ["SD03-006"], playPoints: 2 }, opp: { field: ["V5", "V3"] } }).play("SD03-006").pick("opp:V5", "opp:V3").choose("2");
    expect([t.stats("opp:V5"), t.stats("opp:V3")]).toEqual([[5, 3], [3, 3]]);
    expect(d({ me: { hand: ["SD03-006"], playPoints: 2 } }).canPlay("SD03-006")).toBe(true);
  });

  it("008 / 009 Penguin Wizard — act, engage, discard a spell: draw; evolved: refresh itself", () => {
    const t = d({ me: { field: ["SD03-008"], hand: [INSIGHT, "V1"], deck: ["V3"] } }).activate("SD03-008");
    expect([t.hand(), t.cemetery(), t.engaged("SD03-008")]).toEqual([["V1", "V3"], [INSIGHT], true]);
    expect(d({ me: { field: ["SD03-008"], hand: ["V1"] } }).canActivate("SD03-008")).toBe(false);
    const e = d({ me: { field: [{ card: "SD03-008", engaged: true }], evolveDeck: ["SD03-009"], playPoints: 1 } }).evolve("SD03-008");
    expect([e.engaged("SD03-008"), e.stats("SD03-008")]).toEqual([false, [2, 5]]);
  });

  it("010 / 011 Sammy, Wizard's Apprentice — Fanfare: may bury the top card; evolved: each player draws", () => {
    expect(d({ me: { hand: ["SD03-010"], deck: ["V1", "V3"], playPoints: 1 } }).play("SD03-010").yes().cemetery()).toEqual(["V1"]);
    expect(d({ me: { hand: ["SD03-010"], deck: ["V1", "V3"], playPoints: 1 } }).play("SD03-010").no().zone("me", "deck")).toEqual(["V1", "V3"]);
    const e = d({ me: { field: ["SD03-010"], evolveDeck: ["SD03-011"], deck: ["V1"], playPoints: 2 }, opp: { deck: ["V3"] } }).evolve("SD03-010");
    expect([e.hand(), e.hand("opp")]).toEqual([["V1"], ["V3"]]);
  });

  it("015 Magic Missile — Quick: 2 damage and draw", () => {
    const t = d({ me: { hand: ["SD03-015"], deck: ["V1"], playPoints: 3 }, opp: { field: ["V5"] } }).play("SD03-015");
    expect([t.stats("opp:V5"), t.hand()]).toEqual([[5, 3], ["V1"]]);
    expect(d({ me: { hand: ["SD03-015"], deck: ["V1"], playPoints: 3 } }).canPlay("SD03-015")).toBe(false);
  });

  it("016 Conjure Golem — Quick: a Guardform or Strikeform Golem into the EX area", () => {
    expect(d({ me: { hand: ["SD03-016"], playPoints: 1 } }).play("SD03-016").choose("Strikeform Golem").ex()).toEqual(["BP01-T08"]);
    expect(d({ me: { hand: ["SD03-016"], playPoints: 1 } }).play("SD03-016").choose("Guardform Golem").ex()).toEqual(["BP01-T09"]);
  });
});
