import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP02 Forestcraft (001–017), THE IDOLM@STER CINDERELLA GIRLS. V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral).
// CP02-T01 is a Magical Item (Lesson banishes them from the EX area). BUFF-SOME (0): up to 2 followers of yours +1/+1 this turn.
// iM@S CG followers without abilities besides Evolve: CP02-014 (Cute, 2c), CP02-032 (Cute, 2c), CP02-047 (Passion, 1c),
// CP02-060 (Cute, 1c).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const ITEM = "CP02-T01";

describe("CP02 Forestcraft", () => {
  it("001 / 002 Aiko Takamori — Fanfare: a Passion card from the top 3; evolved: may summon a Passion follower costing 3 or less from the hand", () => {
    const t = d({ me: { hand: ["CP02-001"], deck: ["V1", "CP02-047", "V3"], playPoints: 3 } }).play("CP02-001").pick("CP02-047").order();
    expect([t.hand(), t.zone("me", "deck")]).toEqual([["CP02-047"], ["V1", "V3"]]);
    const e = d({ me: { field: ["CP02-001"], evolveDeck: ["CP02-002"], hand: ["CP02-047", "V1"], playPoints: 1 } }).evolve("CP02-001").pick("CP02-047");
    expect([e.field(), e.hand()]).toEqual([["CP02-001", "CP02-047"], ["V1"]]);
  });

  it("003 Miku Maekawa — Strike: 2 damage to an enemy follower; act (1), Lesson (1): Storm", () => {
    const t = d({ me: { field: ["CP02-003"], ex: [ITEM], playPoints: 1 }, opp: { field: ["V5"] } }).activate("CP02-003");
    expect([t.keywords("CP02-003"), t.ex(), t.pp()]).toEqual([["storm"], [], 0]);
    t.attack("CP02-003", "opp:leader");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 3], 17]);
    expect(d({ me: { field: ["CP02-003"], playPoints: 1 } }).canActivate("CP02-003")).toBe(false);
  });

  it("004 / 005 Yuzu Kitami — Lesson (1): return another 1-cost card; its act abilities are then blocked, even after evolving; evolved: return a 2-cost enemy follower", () => {
    const t = d({ me: { field: ["CP02-004", "CP02-047"], ex: [ITEM, ITEM], evolveDeck: ["CP02-005"], playPoints: 2 } }).activate("CP02-004");
    expect([t.hand(), t.canActivate("CP02-004"), t.canEvolve("CP02-004")]).toEqual([["CP02-047"], false, true]);
    t.evolve("CP02-004");
    expect(t.canActivate("CP02-004")).toBe(false);
    const e = d({ me: { field: ["CP02-004"], evolveDeck: ["CP02-005"], playPoints: 2 }, opp: { field: ["V2", "V3"] } }).evolve("CP02-004");
    expect([e.hand("opp"), e.keywords("CP02-004")]).toEqual([["V2"], ["ward"]]);
  });

  it("006 Anastasia — Fanfare: recover 2; the 3rd card played this turn recovers 2, the 5th gives your followers +1/+1", () => {
    expect(d({ me: { hand: ["CP02-006"], playPoints: 5 } }).play("CP02-006").pp()).toBe(2);
    // Played as the 3rd card, her own ability is not on the field yet (ruling): only the Fanfare.
    expect(d({ me: { hand: ["CP02-006"], playedThisTurn: 2, playPoints: 5 } }).play("CP02-006").pp()).toBe(2);
    const third = d({ me: { field: ["CP02-006"], hand: ["BUFF-SOME", "BUFF-SOME"], playedThisTurn: 1, playPoints: 0 } });
    third.play("BUFF-SOME").none();
    expect(third.pp()).toBe(0);
    third.play("BUFF-SOME").none();
    expect(third.pp()).toBe(2);
    const fifth = d({ me: { field: ["CP02-006", "V1"], hand: ["BUFF-SOME"], playedThisTurn: 4 } }).play("BUFF-SOME").none();
    expect([fifth.stats("CP02-006"), fifth.stats("V1")]).toEqual([[3, 5], [3, 3]]);
  });

  it("007 Brand New Beat — act: engage and bury, +1/+1; leaving the field draws if a Magical Item was banished from your EX area this turn", () => {
    const t = d({ me: { field: ["CP02-007", "V1", "CP02-003"], ex: [ITEM], deck: ["V3"], playPoints: 1 } });
    t.activate("CP02-003").activate("CP02-007").pick("V1");
    expect([t.stats("V1"), t.hand(), t.field()]).toEqual([[3, 3], ["V3"], ["V1", "CP02-003"]]);
    const none = d({ me: { field: ["CP02-007", "V1"], deck: ["V3"] } }).activate("CP02-007");
    expect([none.stats("V1"), none.hand()]).toEqual([[3, 3], []]);
    // Playing a Magical Item as a spell doesn't banish it (ruling).
    const played = d({ me: { field: ["CP02-007", "V1"], ex: [ITEM], deck: ["V3", "V5"], playPoints: 4 } }).play(`${ITEM}@ex`).activate("CP02-007");
    expect(played.hand()).toEqual(["V3"]);
  });

  it("008 Shinobu Kudo — Fanfare: summon up to two 1-cost iM@S CG followers or amulets with different names", () => {
    const t = d({ me: { hand: ["CP02-008"], deck: ["CP02-047", "CP02-047", "CP02-060", "V1"], playPoints: 4 } }).play("CP02-008").pick("CP02-047");
    expect(t.decision).toMatchObject({ type: "selectCards", candidateDefs: ["CP02-060"] });
    t.pick("CP02-060");
    expect(t.field()).toEqual(["CP02-008", "CP02-047", "CP02-060"]);
  });

  it("009 / 010 Yumi Aiba — Fanfare with 3 Passion followers: 2 damage; evolved: an enemy follower with 3 defense or less to the bottom of its deck", () => {
    expect(d({ me: { hand: ["CP02-009"], field: ["CP02-047", "CP02-004"], playPoints: 3 }, opp: { field: ["V5"] } }).play("CP02-009").stats("opp:V5")).toEqual([5, 3]);
    expect(d({ me: { hand: ["CP02-009"], field: ["CP02-047"], playPoints: 3 }, opp: { field: ["V5"] } }).play("CP02-009").stats("opp:V5")).toEqual([5, 5]);
    const e = d({ me: { field: ["CP02-009"], evolveDeck: ["CP02-010"], playPoints: 1 }, opp: { field: ["V2", "V5"] } }).evolve("CP02-009");
    expect([e.field("opp"), e.zone("opp", "deck")]).toEqual([["V5"], ["V2"]]);
  });

  it("011 Goddess by the Sunlit Sea — draw; recover 1 with a 5-cost follower on your field", () => {
    const t = d({ me: { hand: ["CP02-011"], field: ["V5"], deck: ["V1"], playPoints: 1 } }).play("CP02-011");
    expect([t.hand(), t.pp()]).toEqual([["V1"], 1]);
    expect(d({ me: { hand: ["CP02-011"], field: ["V3"], deck: ["V1"], playPoints: 1 } }).play("CP02-011").pp()).toBe(0);
  });

  it("012 Honoka Ayase — Fanfare: Rush to another iM@S CG follower", () => {
    expect(d({ me: { hand: ["CP02-012"], field: ["CP02-014", "V1"], playPoints: 1 } }).play("CP02-012").keywords("CP02-014")).toEqual(["rush"]);
  });

  it("013 Azuki Momoi — 3 less with 3 iM@S CG followers on your field; Ward", () => {
    expect(d({ me: { hand: ["CP02-013"], field: ["CP02-014", "CP02-032", "CP02-047"], playPoints: 1 } }).canPlay("CP02-013")).toBe(true);
    expect(d({ me: { hand: ["CP02-013"], field: ["CP02-014", "CP02-032", "V1"], playPoints: 1 } }).canPlay("CP02-013")).toBe(false);
  });

  it("014 / 015 Kana Imai — evolved: may take the top card; a Cute card gives the leader +2", () => {
    const cute = d({ me: { field: ["CP02-014"], evolveDeck: ["CP02-015"], deck: ["CP02-003"], playPoints: 1 } }).evolve("CP02-014").pick("CP02-003");
    expect([cute.hand(), cute.leader()]).toEqual([["CP02-003"], 22]);
    const other = d({ me: { field: ["CP02-014"], evolveDeck: ["CP02-015"], deck: ["V1"], playPoints: 1 } }).evolve("CP02-014").pick("V1");
    expect([other.hand(), other.leader()]).toEqual([["V1"], 20]);
    const kept = d({ me: { field: ["CP02-014"], evolveDeck: ["CP02-015"], deck: ["CP02-003"], playPoints: 1 } }).evolve("CP02-014").none();
    expect([kept.zone("me", "deck"), kept.leader()]).toEqual([["CP02-003"], 20]);
  });

  it("016 Otoha Umeki — whenever you play a card: 1 damage to an enemy follower", () => {
    expect(d({ me: { field: ["CP02-016"], hand: ["BUFF-SOME"] }, opp: { field: ["V5"] } }).play("BUFF-SOME").none().stats("opp:V5")).toEqual([5, 4]);
  });

  it("017 A Single Vessel — Fanfare / Last Words: 3 damage; act (2), engage, discard: bury this", () => {
    expect(d({ me: { hand: ["CP02-017"], playPoints: 2 }, opp: { field: ["V5"] } }).play("CP02-017").stats("opp:V5")).toEqual([5, 2]);
    const t = d({ me: { field: ["CP02-017"], hand: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } }).activate("CP02-017");
    expect([t.stats("opp:V5"), t.cemetery().sort(), t.field()]).toEqual([[5, 2], ["CP02-017", "V1"], []]);
  });
});
