import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP21 Dragoncraft (055–072, T06, T07). V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5 (Neutral). QUICK-SAC (0) destroys one of your
// followers. Academic (学院): BP21-063 (1c 1/1, Storm), BP21-069 (1c 1/1, Ward), BP21-061 (2c 3/1). Dragonewt: BP21-061,
// BP21-063, BP21-058. Passion counters: BP21-057 Coach Joe in the EX area. Tokens: BP21-T06 Lilium's Hatchling, BP21-T07
// Lilium's Dragon.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SUPER = { superEvolutionPoints: 1, turnsPassed: 8 };
const joe = (passion: number) => ({ card: "BP21-057", counters: { passion } });

describe("BP21 Dragoncraft", () => {
  it("055 / 056 Lilium, the Wyrmwitch — evolved: another Academic follower from the deck; end phase with 3 Academic followers: a Hatchling; super-evolved: a Lilium's Dragon", () => {
    const e = d({ me: { field: ["BP21-055"], evolveDeck: ["BP21-056"], deck: ["BP21-055", "BP21-063"], playPoints: 1 } }).evolve("BP21-055").pick("BP21-063");
    expect(e.hand()).toEqual(["BP21-063"]);
    const t = d({ me: { field: [{ card: "BP21-055", evolvedInto: "BP21-056" }, "BP21-063", "BP21-069"] }, opp: { deck: ["V1"] } }).end().none();
    expect(t.field()).toEqual(["BP21-055", "BP21-063", "BP21-069", "BP21-T06"]);
    const s = d({ me: { field: ["BP21-055"], evolveDeck: ["BP21-056"], playPoints: 1, ...SUPER } }).evolve("BP21-055", { sep: true }).flush();
    expect(s.field()).toEqual(["BP21-055", "BP21-T07"]);
  });

  it("T06 Lilium's Hatchling / T07 Lilium's Dragon — Last Words: leader +1; Follower Strike: the enemy follower becomes 1/1", () => {
    expect(d({ me: { field: ["BP21-T06"], hand: ["QUICK-SAC"] } }).play("QUICK-SAC").leader()).toBe(21);
    const t = d({ me: { field: ["BP21-T07"] }, opp: { field: ["V5"] } }).attack("BP21-T07", "opp:V5");
    expect([t.field("opp"), t.stats("BP21-T07")]).toEqual([[], [5, 4]]);
  });

  it("057 Coach Joe, Fiery Counselor — act (0) from the hand into the EX area; there, a passion counter for each Academic follower entering; act with 10: 5 to each enemy and +0/+6", () => {
    expect(d({ me: { hand: ["BP21-057"] } }).activate("BP21-057@hand").ex()).toEqual(["BP21-057"]);
    expect(d({ me: { ex: ["BP21-057"], hand: ["BP21-063"], playPoints: 1 } }).play("BP21-063").counters("BP21-057@ex", "passion")).toBe(1);
    const t = d({ me: { field: [joe(10)] }, opp: { field: ["V5"] } }).activate("BP21-057");
    expect([t.leader("opp"), t.field("opp"), t.stats("BP21-057")]).toEqual([15, [], [5, 11]]);
    expect(d({ me: { field: [joe(9)] }, opp: { field: ["V5"] } }).activate("BP21-057").leader("opp")).toBe(20);
  });

  it("058 Lumiore, Prestigious Gold — Fanfare, discard: a 2-cost and a 1-cost Dragonewt follower from the deck; end phase with 3 Dragonewt followers: 3 to each enemy", () => {
    const t = d({ me: { hand: ["BP21-058", "V1"], deck: ["BP21-061", "BP21-063", "V3"], playPoints: 6 } }).play("BP21-058").yes();
    t.pick("BP21-061").pick("BP21-063");
    expect([t.field(), t.cemetery()]).toEqual([["BP21-058", "BP21-061", "BP21-063"], ["V1"]]);
    const e = d({ me: { field: ["BP21-058", "BP21-061", "BP21-063"] }, opp: { field: ["V5"], deck: ["V1"] } }).end();
    expect([e.leader("opp"), e.stats("opp:V5")]).toEqual([17, [5, 2]]);
  });

  it("059 / 060 Grand Slam Tamer — Fanfare with Overflow: an Academic card from the top 3; evolved: 2 damage, 4 with 4 passion counters, +0/+6 with 10", () => {
    const t = d({ me: { hand: ["BP21-059"], deck: ["V1", "BP21-063", "V3"], playPoints: 7, maxPlayPoints: 7 } }).play("BP21-059").pick("BP21-063").order();
    expect(t.hand()).toEqual(["BP21-063"]);
    expect(d({ me: { hand: ["BP21-059"], deck: ["BP21-063"], playPoints: 6, maxPlayPoints: 6 } }).play("BP21-059").hand()).toEqual([]);
    const e = d({ me: { field: ["BP21-059"], evolveDeck: ["BP21-060"], ex: [joe(10)], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP21-059");
    expect([e.stats("opp:V5"), e.stats("BP21-059")]).toEqual([[5, 1], [3, 9]]);
    expect(d({ me: { field: ["BP21-059"], evolveDeck: ["BP21-060"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP21-059").stats("opp:V5")).toEqual([5, 3]);
  });

  it("061 Dion, Scarlet Scion — Rush, Assail; Strike with 4 passion counters: max play points +1; with 10: +0/+6", () => {
    const t = d({ me: { field: ["BP21-061"], ex: [joe(4)], maxPlayPoints: 5 }, opp: { field: ["V1"] } }).attack("BP21-061", "opp:V1");
    expect(t.game.state.players[0].maxPlayPoints).toBe(6);
    const s = d({ me: { field: ["BP21-061"], ex: [joe(10)], maxPlayPoints: 5 }, opp: { field: ["V1"] } }).attack("BP21-061", "opp:V1");
    expect([s.stats("BP21-061"), s.field("opp")]).toEqual([[3, 5], []]);
  });

  it("062 Argente, Purest Silver — Ward; Fanfare: draw; end phase with Lumiore: leader +3", () => {
    expect(d({ me: { hand: ["BP21-062"], deck: ["V1"], playPoints: 2 } }).play("BP21-062").none().hand()).toEqual(["V1"]);
    expect(d({ me: { field: ["BP21-062", "BP21-058"] }, opp: { deck: ["V1"] } }).end().flush().leader()).toBe(23);
  });

  it("063 / 064 Dragonborn Striker — Storm; Strike with 4 passion counters: evolve; with 10: +0/+6", () => {
    const t = d({ me: { hand: ["BP21-063"], evolveDeck: ["BP21-064"], ex: [joe(10)], playPoints: 1 } }).play("BP21-063").attack("BP21-063", "opp:leader").yes();
    expect([t.stats("BP21-063"), t.leader("opp")]).toEqual([[3, 9], 17]);
  });

  it("065 Gunbein, Lofty Dragonewt — Ward; Fanfare (2): another Gunbein from the deck; act with 4 passion counters: 4 damage", () => {
    const t = d({ me: { hand: ["BP21-065"], deck: ["BP21-065", "V1"], playPoints: 5 } }).play("BP21-065").none().yes().pick("BP21-065").none();
    expect([t.field(), t.pp()]).toEqual([["BP21-065", "BP21-065"], 0]);
    expect(d({ me: { field: ["BP21-065"], ex: [joe(4)] }, opp: { field: ["V5"] } }).activate("BP21-065").stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { field: ["BP21-065"], ex: [joe(3)] }, opp: { field: ["V5"] } }).activate("BP21-065").stats("opp:V5")).toEqual([5, 5]);
  });

  it("066 Charlotte, Dragonewt — Storm, Ward; Fanfare: reveal the top card, summon it if a Dragoncraft follower, else draw it", () => {
    expect(d({ me: { hand: ["BP21-066"], deck: ["BP21-063"], playPoints: 10 } }).play("BP21-066").none().field()).toEqual(["BP21-066", "BP21-063"]);
    expect(d({ me: { hand: ["BP21-066"], deck: ["V1"], playPoints: 10 } }).play("BP21-066").none().hand()).toEqual(["V1"]);
  });

  it("067 / 068 Ipupiara — Fanfare: evolves unless put onto the field from the hand; evolved: Assail, Bane, Strike: 2 to the enemy leader", () => {
    expect(d({ me: { hand: ["BP21-067"], evolveDeck: ["BP21-068"], playPoints: 3 } }).play("BP21-067").stats("BP21-067")).toEqual([3, 3]);
    const t = d({ me: { ex: ["BP21-067"], evolveDeck: ["BP21-068"], playPoints: 3 } }).play("BP21-067@ex").yes();
    expect([t.stats("BP21-067"), t.keywords("BP21-067")]).toEqual([[3, 5], ["assail", "bane"]]);
    expect(d({ me: { field: [{ card: "BP21-067", evolvedInto: "BP21-068" }] } }).attack("BP21-067", "opp:leader").leader("opp")).toBe(15);
  });

  it("069 Megalorca Rider — Ward; Last Words: draw; act with 4 passion counters: leader +2, with 10: +0/+6", () => {
    const t = d({ me: { field: ["BP21-069"], ex: [joe(10)] } }).activate("BP21-069");
    expect([t.leader(), t.stats("BP21-069")]).toEqual([22, [1, 7]]);
    expect(d({ me: { field: ["BP21-069"], hand: ["QUICK-SAC"], deck: ["V1"] } }).play("QUICK-SAC").hand()).toEqual(["V1"]);
  });

  it("070 Augite Wyrm — Fanfare: 6 to each enemy follower; act (1) from the hand, discard this: draw", () => {
    expect(d({ me: { hand: ["BP21-070"], playPoints: 9 }, opp: { field: ["V5", "V3"] } }).play("BP21-070").field("opp")).toEqual([]);
    const t = d({ me: { hand: ["BP21-070"], deck: ["V1"], playPoints: 1 } }).activate("BP21-070@hand");
    expect([t.hand(), t.cemetery(), t.pp()]).toEqual([["V1"], ["BP21-070"], 0]);
  });

  it("071 Stormscale — once per turn, a non-Dragoncraft card into your EX area: 5 damage and leader +2; Fanfare: the top card into the EX area twice", () => {
    const t = d({ me: { hand: ["BP21-071"], deck: ["V1", "V3"], playPoints: 6 }, opp: { field: ["V5", "V1"] } }).play("BP21-071").pick("opp:V5");
    expect([t.field("opp"), t.leader(), t.ex(), t.decision?.type]).toEqual([["V1"], 22, ["V1", "V3"], "mainPhase"]);
    const dragons = d({ me: { hand: ["BP21-071"], deck: ["BP21-063", "BP21-072"], playPoints: 6 }, opp: { field: ["V5"] } }).play("BP21-071");
    expect([dragons.stats("opp:V5"), dragons.ex()]).toEqual([[5, 5], ["BP21-063", "BP21-072"]]);
  });

  it("072 Dragon Hunt — destroy an enemy follower; draw if it cost 4 or more", () => {
    const t = d({ me: { hand: ["BP21-072"], deck: ["V1"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP21-072");
    expect([t.field("opp"), t.hand()]).toEqual([[], ["V1"]]);
    expect(d({ me: { hand: ["BP21-072"], deck: ["V1"], playPoints: 3 }, opp: { field: ["V3"] } }).play("BP21-072").hand()).toEqual([]);
  });
});
