import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// CP03 Runecraft (042–062), Cardfight!! Vanguard (Pale Moon). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral). CP03-127
// is a Drive Point. Pale Moon followers: CP03-052 Dark Metal Bicorn (1c 2/2), CP03-051 Turquoise Beast Tamer (2c 2/2), CP03-043
// Nightmare Doll, Alice (3c), CP03-049 Golden Beast Tamer (4c).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);
const DP = "CP03-127";

describe("CP03 Runecraft", () => {
  it("042 Luquier — Rush, Twin Drive; Fanfare: Pale Moon followers costing 4, 3 and 2 or less from your banished zone", () => {
    const t = d({ me: { hand: ["CP03-042"], banished: ["CP03-049", "CP03-043", "CP03-051", "V1"], deck: ["V1"], playPoints: 7 } }).play("CP03-042");
    t.pick("CP03-049").pick("CP03-043").pick("CP03-051").flush();
    expect([t.field(), t.keywords("CP03-042")]).toEqual([["CP03-042", "CP03-049", "CP03-043", "CP03-051"], ["rush", "twinDrive"]]);
  });

  it("043 / 044 Nightmare Doll, Alice — Fanfare: banish the top card, draw with 5 banished; evolved: a banished Pale Moon follower", () => {
    const t = d({ me: { hand: ["CP03-043"], banished: n(4, "V1"), deck: ["V3", "V5"], playPoints: 3 } }).play("CP03-043");
    expect([t.hand(), t.zone("me", "banished").length]).toEqual([["V5"], 5]);
    const cheap = d({ me: { field: ["CP03-043"], evolveDeck: ["CP03-044"], banished: ["CP03-051", "CP03-049"], playPoints: 1 } }).evolve("CP03-043").choose("1");
    expect(cheap.field()).toEqual(["CP03-043", "CP03-051"]);
    const paid = d({ me: { field: ["CP03-043"], evolveDeck: ["CP03-044"], banished: ["CP03-051", "CP03-049"], playPoints: 5 } }).evolve("CP03-043").choose("2");
    paid.pick("CP03-049").yes().flush();
    // Golden Beast Tamer's own Fanfare then summons the 2-cost one.
    expect([paid.field(), paid.pp()]).toEqual([["CP03-043", "CP03-049", "CP03-051"], 0]);
  });

  it("045 Purple Trapezist — Fanfare: draw and banish a card from the hand, or Storm to a Pale Moon follower with 5 banished", () => {
    const t = d({ me: { hand: ["CP03-045", "V3"], deck: ["V1"], playPoints: 2 } }).play("CP03-045").choose("1").pick("V3");
    expect([t.hand(), t.zone("me", "banished")]).toEqual([["V1"], ["V3"]]);
    expect(d({ me: { hand: ["CP03-045"], banished: n(5, "V1"), deck: ["V1"], playPoints: 2 } }).play("CP03-045").choose("2").keywords("CP03-045")).toEqual(["storm"]);
  });

  it("046 / 047 Crimson Beast Tamer — Ward; Fanfare, banish a Pale Moon card from the hand: draw 2; Barking Manticore: 4 damage", () => {
    const t = d({ me: { hand: ["CP03-046", "CP03-052"], deck: ["V1", "V1"], playPoints: 4 } }).play("CP03-046").none().yes();
    expect([t.hand(), t.zone("me", "banished")]).toEqual([["V1", "V1"], ["CP03-052"]]);
    const e = d({ me: { field: ["CP03-046"], evolveDeck: ["CP03-047"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("CP03-046");
    expect([e.stats("opp:V5"), e.keywords("CP03-046")]).toEqual([[5, 1], ["ward", "twinDrive"]]);
  });

  it("048 Mistress Hurricane — Fanfare with 5 banished: Storm; act, engage and banish this: 3 damage", () => {
    expect(d({ me: { hand: ["CP03-048"], banished: n(5, "V1"), playPoints: 2 } }).play("CP03-048").keywords("CP03-048")).toEqual(["storm"]);
    const a = d({ me: { field: ["CP03-048"] }, opp: { field: ["V5"] } }).activate("CP03-048");
    expect([a.stats("opp:V5"), a.zone("me", "banished")]).toEqual([[5, 2], ["CP03-048"]]);
  });

  it("049 Golden Beast Tamer — Fanfare: a 2-cost Pale Moon follower from the banished zone; act: damage equal to your Pale Moon followers", () => {
    expect(d({ me: { hand: ["CP03-049"], banished: ["CP03-051", "V1"], playPoints: 4 } }).play("CP03-049").field()).toEqual(["CP03-049", "CP03-051"]);
    expect(d({ me: { field: ["CP03-049", "CP03-051", "V1"] }, opp: { field: ["V5"] } }).activate("CP03-049").stats("opp:V5")).toEqual([5, 3]);
  });

  it("050 Farah — Ride (1): +1/+1; with 5 banished, destroy up to 1 enemy follower and leader +2", () => {
    const t = d({ me: { field: ["CP03-050"], evolveDeck: [DP], banished: n(5, "V1"), playPoints: 1 }, opp: { field: ["V5"] } }).activate("CP03-050").pick("opp:V5");
    expect([t.field("opp"), t.leader(), t.stats("CP03-050")]).toEqual([[], 22, [4, 4]]);
    const four = d({ me: { field: ["CP03-050"], evolveDeck: [DP], banished: n(4, "V1"), playPoints: 1 }, opp: { field: ["V5"] } }).activate("CP03-050").pick("opp:V5");
    expect([four.field("opp"), four.leader(), four.stats("CP03-050")]).toEqual([["V5"], 20, [4, 4]]);
  });

  it("051 Turquoise Beast Tamer — Ride (1): 2 damage to up to 1, +1/+1, banish the top card", () => {
    const t = d({ me: { field: ["CP03-051"], evolveDeck: [DP], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5"] } }).activate("CP03-051").pick("opp:V5");
    expect([t.stats("opp:V5"), t.stats("CP03-051"), t.zone("me", "banished")]).toEqual([[5, 3], [3, 3], ["V1"]]);
  });

  it("052 Dark Metal Bicorn — act, engage: draw, then banish a card from your hand", () => {
    const t = d({ me: { field: ["CP03-052"], hand: ["V3"], deck: ["V1"] } }).activate("CP03-052").pick("V3");
    expect([t.hand(), t.zone("me", "banished")]).toEqual([["V1"], ["V3"]]);
  });

  it("053 Nitro Juggler — Fanfare: banish up to 2 of the top 5; with 5 banished: Bane and Ward", () => {
    const t = d({ me: { hand: ["CP03-053"], deck: ["V1", "V2", "V3", "V5", "V1"], banished: n(3, "V3"), playPoints: 3 } }).play("CP03-053");
    expect(t.keywords("CP03-053")).toEqual([]);
    t.pick("V1", "V2").order();
    expect([t.keywords("CP03-053"), t.zone("me", "deck").length]).toEqual([["bane", "ward"], 3]);
  });

  it("054 Midnight Bunny — Ride (1): +1/+1; of the top 2, one to the hand and the other banished", () => {
    const t = d({ me: { field: ["CP03-054"], evolveDeck: [DP], deck: ["V1", "V3"], playPoints: 1 } }).activate("CP03-054").pick("V3");
    expect([t.hand(), t.zone("me", "banished"), t.stats("CP03-054")]).toEqual([["V3"], ["V1"], [3, 3]]);
  });

  it("055 Hades Hypnotist — Quick; 2 damage, or discard a Pale Moon card: 3 damage and banish your top 3 cards", () => {
    const t = d({ me: { hand: ["CP03-055", "CP03-052"], deck: ["V1", "V1", "V1", "V3"], playPoints: 1 }, opp: { field: ["V5"] } }).play("CP03-055").choose("2").yes();
    expect([t.stats("opp:V5"), t.zone("me", "deck"), t.zone("me", "banished").length]).toEqual([[5, 2], ["V3"], 3]);
  });

  it("056 Dynamite Juggler — Fanfare: banish the top card; with 5 banished, 2 to the enemy leader", () => {
    expect(d({ me: { hand: ["CP03-056"], banished: n(4, "V1"), deck: ["V3"], playPoints: 2 } }).play("CP03-056").leader("opp")).toBe(18);
    expect(d({ me: { hand: ["CP03-056"], banished: n(3, "V1"), deck: ["V3"], playPoints: 2 } }).play("CP03-056").leader("opp")).toBe(20);
  });

  it("057 Rainbow Magician — Fanfare: a banished Pale Moon card to the hand, then banish a card from your hand", () => {
    const t = d({ me: { hand: ["CP03-057", "V3"], banished: ["CP03-052"], playPoints: 2 } }).play("CP03-057").pick("V3");
    expect([t.hand(), t.zone("me", "banished")]).toEqual([["CP03-052"], ["V3"]]);
  });

  it("058 Skyhigh Walker — act, banish this: refresh another Pale Moon follower, which can't attack enemy leaders this turn", () => {
    const t = d({ me: { field: ["CP03-058", { card: "CP03-052", engaged: true }] } }).activate("CP03-058");
    expect([t.engaged("CP03-052"), t.attackTargets("CP03-052"), t.zone("me", "banished")]).toEqual([false, [], ["CP03-058"]]);
  });

  it("059 Candy Clown — Ward; Fanfare: leader +2, banish the top card", () => {
    const t = d({ me: { hand: ["CP03-059"], deck: ["V1"], playPoints: 2 } }).play("CP03-059").none();
    expect([t.leader(), t.zone("me", "banished")]).toEqual([22, ["V1"]]);
  });

  it("060 Jumping Jill — Ride (3): up to 1 banished Pale Moon card to the hand, +1/+1; Fanfare: banish the top 2", () => {
    const t = d({ me: { field: ["CP03-060"], evolveDeck: [DP], banished: ["CP03-052"], playPoints: 3 } }).activate("CP03-060").pick("CP03-052");
    expect([t.hand(), t.stats("CP03-060")]).toEqual([["CP03-052"], [3, 3]]);
    expect(d({ me: { hand: ["CP03-060"], deck: ["V1", "V3", "V5"], playPoints: 1 } }).play("CP03-060").zone("me", "banished")).toEqual(["V1", "V3"]);
  });

  it("061 Skull Juggler — banish 2 Pale Moon cards from your cemetery and draw; not playable with 1", () => {
    const t = d({ me: { hand: ["CP03-061"], cemetery: ["CP03-052", "CP03-051", "V1"], deck: ["V1"], playPoints: 1 } }).play("CP03-061");
    expect([t.zone("me", "banished").sort(), t.hand()]).toEqual([["CP03-051", "CP03-052"], ["V1"]]);
    expect(d({ me: { hand: ["CP03-061"], cemetery: ["CP03-052", "V1"], playPoints: 1 } }).canPlay("CP03-061")).toBe(false);
  });

  it("062 Girl Who Crossed the Gap — Starting Amulet; act, engage and bury, with a Pale Moon follower: draw, then banish a card from your hand", () => {
    const t = d({ me: { field: ["CP03-062", "CP03-052"], hand: ["V3"], deck: ["V1"] } }).activate("CP03-062").pick("V3");
    expect([t.hand(), t.zone("me", "banished"), t.field()]).toEqual([["V1"], ["V3"], ["CP03-052"]]);
    expect(d({ me: { field: ["CP03-062", "V1"] } }).canActivate("CP03-062")).toBe(false);
  });
});
