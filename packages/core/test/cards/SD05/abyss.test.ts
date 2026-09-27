import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// SD05 (Abysscraft starter deck). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). Tokens: BP01-T15 Forest Bat (1/1 Vampire), BP01-T14
// Ghost. QUICK-SAC (0) destroys a follower of yours.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const BAT = "BP01-T15";

describe("SD05 Abysscraft", () => {
  it("001 Queen Vampire — Fanfare: 2 Forest Bats; act, engage, leader -1: 2 more; entering Forest Bats get +1 attack and Ward", () => {
    const t = d({ me: { hand: ["SD05-001"], playPoints: 6 } }).play("SD05-001").flush();
    expect([t.field(), t.stats(BAT), t.keywords(BAT)]).toEqual([["SD05-001", BAT, BAT], [2, 1], ["ward"]]);
    const a = d({ me: { field: ["SD05-001"] } }).activate("SD05-001").flush();
    expect([a.field().length, a.leader(), a.engaged("SD05-001")]).toEqual([3, 19, true]);
  });

  it("002 Alucard — Storm; Fanfare, Necrocharge (10): +2 attack; Strike: 4 damage and leader +4", () => {
    expect(d({ me: { hand: ["SD05-002"], cemetery: n(10, "V1"), playPoints: 7 } }).play("SD05-002").stats("SD05-002")).toEqual([6, 4]);
    const t = d({ me: { field: ["SD05-002"] }, opp: { field: ["V5"] } }).attack("SD05-002", "opp:leader");
    expect([t.stats("opp:V5"), t.leader(), t.leader("opp")]).toEqual([[5, 1], 24, 16]);
    // No enemy follower to select: no defense either (ruling).
    expect(d({ me: { field: ["SD05-002"] } }).attack("SD05-002", "opp:leader").leader()).toBe(20);
  });

  it("003 / 004 Playful Necromancer — evolved: 3 Ghosts (as many as fit)", () => {
    expect(d({ me: { field: ["SD05-003"], evolveDeck: ["SD05-004"], playPoints: 1 } }).evolve("SD05-003").field()).toEqual(["SD05-003", "BP01-T14", "BP01-T14", "BP01-T14"]);
    expect(d({ me: { field: ["SD05-003", "V1", "V1", "V1"], evolveDeck: ["SD05-004"], playPoints: 1 } }).evolve("SD05-003").field().length).toBe(5);
  });

  it("005 Midnight Vampire — Fanfare: a Forest Bat; your Forest Bats have Drain", () => {
    const t = d({ me: { hand: ["SD05-005"], field: [BAT], playPoints: 3 } }).play("SD05-005");
    expect([t.field(), t.keywords(BAT)]).toEqual([[BAT, "SD05-005", BAT], ["drain"]]);
  });

  it("006 Night Horde — 2 Forest Bats, then damage equal to the Forest Bats on your field", () => {
    const t = d({ me: { hand: ["SD05-006"], field: [BAT], playPoints: 3 }, opp: { field: ["V5"] } }).play("SD05-006");
    expect([t.field(), t.stats("opp:V5")]).toEqual([[BAT, BAT, BAT], [5, 2]]);
    expect(d({ me: { hand: ["SD05-006"], playPoints: 3 } }).canPlay("SD05-006")).toBe(false);
  });

  it("010 / 011 Lesser Mummy — Fanfare, Necrocharge (10): Storm; evolved Strike: a Ghost", () => {
    expect(d({ me: { hand: ["SD05-010"], cemetery: n(10, "V1"), playPoints: 2 } }).play("SD05-010").keywords("SD05-010")).toEqual(["storm"]);
    const e = d({ me: { field: [{ card: "SD05-010", evolvedInto: "SD05-011" }] } }).attack("SD05-010", "opp:leader");
    expect(e.field()).toEqual(["SD05-010", "BP01-T14"]);
  });

  it("012 / 013 Lilith — Fanfare: a Forest Bat into the EX area; evolved Strike: leader +2", () => {
    expect(d({ me: { hand: ["SD05-012"], playPoints: 2 } }).play("SD05-012").ex()).toEqual([BAT]);
    expect(d({ me: { field: [{ card: "SD05-012", evolvedInto: "SD05-013" }] } }).attack("SD05-012", "opp:leader").leader()).toBe(22);
  });

  it("015 Undying Resentment — Quick: 3 damage and bury your top card", () => {
    const t = d({ me: { hand: ["SD05-015"], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } }).play("SD05-015");
    expect([t.stats("opp:V5"), t.cemetery()]).toEqual([[5, 2], ["V1", "SD05-015"]]);
  });

  it("016 Summon Bloodkin — a Forest Bat onto the field and one into the EX area", () => {
    const t = d({ me: { hand: ["SD05-016"], playPoints: 1 } }).play("SD05-016");
    expect([t.field(), t.ex()]).toEqual([[BAT], [BAT]]);
  });
});
