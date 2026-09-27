import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// SD04 (Dragoncraft starter deck). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). Overflow: 7 or more max play points. BP01-T11 is the
// Dragon token.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const OVERFLOW = { maxPlayPoints: 7 };

describe("SD04 Dragoncraft", () => {
  it("001 Fafnir — Fanfare: 5 damage to each enemy follower", () => {
    const t = d({ me: { hand: ["SD04-001"], playPoints: 8 }, opp: { field: ["V5", { card: "V3", damage: 0 }] } }).play("SD04-001");
    expect(t.field("opp")).toEqual([]);
  });

  it("002 Dragon Oracle — max play points +1, or draw", () => {
    const t = d({ me: { hand: ["SD04-002"], playPoints: 2, maxPlayPoints: 5 } }).play("SD04-002").choose("1");
    expect([t.game.state.players[0].maxPlayPoints, t.pp()]).toEqual([6, 0]);
    expect(d({ me: { hand: ["SD04-002"], deck: ["V1"], playPoints: 2 } }).play("SD04-002").choose("2").hand()).toEqual(["V1"]);
  });

  it("003 / 004 Dragon Warrior — evolved: 3 damage to an enemy follower", () => {
    expect(d({ me: { field: ["SD04-003"], evolveDeck: ["SD04-004"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("SD04-003").stats("opp:V5")).toEqual([5, 2]);
  });

  it("005 Dragonewt Princess — Fanfare with Overflow: 4 damage", () => {
    expect(d({ me: { hand: ["SD04-005"], playPoints: 2, ...OVERFLOW }, opp: { field: ["V5"] } }).play("SD04-005").stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { hand: ["SD04-005"], playPoints: 2 }, opp: { field: ["V5"] } }).play("SD04-005").stats("opp:V5")).toEqual([5, 5]);
  });

  it("006 Dragonguard — Ward; Fanfare with Overflow: +2/+2", () => {
    expect(d({ me: { hand: ["SD04-006"], playPoints: 4, ...OVERFLOW } }).play("SD04-006").none().stats("SD04-006")).toEqual([6, 7]);
    expect(d({ me: { hand: ["SD04-006"], playPoints: 4 } }).play("SD04-006").none().stats("SD04-006")).toEqual([4, 5]);
  });

  it("009 / 010 Roc — Evolve (0); Strike: +1 attack; evolved Strike: +1/+1", () => {
    const t = d({ me: { field: ["SD04-009"] } }).attack("SD04-009", "opp:leader");
    expect([t.stats("SD04-009"), t.leader("opp")]).toEqual([[4, 3], 16]);
    const e = d({ me: { field: ["SD04-009"], evolveDeck: ["SD04-010"] } }).evolve("SD04-009").attack("SD04-009", "opp:leader");
    expect([e.stats("SD04-009"), e.leader("opp")]).toEqual([[4, 4], 16]);
  });

  it("011 Glint Dragon — Fanfare: 3 damage", () => {
    expect(d({ me: { hand: ["SD04-011"], playPoints: 4 }, opp: { field: ["V5"] } }).play("SD04-011").stats("opp:V5")).toEqual([5, 2]);
  });

  it("012 / 013 Dragonrider — Fanfare with Overflow: a Dragon into the EX area; evolved with Overflow: +2 attack", () => {
    expect(d({ me: { hand: ["SD04-012"], playPoints: 2, ...OVERFLOW } }).play("SD04-012").ex()).toEqual(["BP01-T11"]);
    expect(d({ me: { hand: ["SD04-012"], playPoints: 2 } }).play("SD04-012").ex()).toEqual([]);
    expect(d({ me: { field: ["SD04-012"], evolveDeck: ["SD04-013"], playPoints: 1, ...OVERFLOW } }).evolve("SD04-012").stats("SD04-012")).toEqual([5, 3]);
  });

  it("014 Seabrand Dragon — Fanfare with Overflow: Storm", () => {
    expect(d({ me: { hand: ["SD04-014"], playPoints: 4, ...OVERFLOW } }).play("SD04-014").keywords("SD04-014")).toEqual(["storm"]);
    expect(d({ me: { hand: ["SD04-014"], playPoints: 4 } }).play("SD04-014").keywords("SD04-014")).toEqual([]);
  });
});
