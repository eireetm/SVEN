import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP14 Dragoncraft (053–069, T04). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral); QUICK-SAC destroys
// one of your followers. Overflow is max play points 7 or more. Festive: BP14-008 (2), BP14-012 (2).
// BP14-059 Soothing Dragonspring holds divine water counters. BP14-058 is a 1-cost Dragoncraft follower,
// BP14-067 a Marine follower. Tokens: BP14-T04 Tidal Tyranny, BP01-T11 Dragon.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const OVERFLOW = { playPoints: 7, maxPlayPoints: 7 };
const SPRING = "BP14-059";
const WATER = "divineWater";
const spring = (count: number) => ({ card: SPRING, counters: { [WATER]: count } });
const n = (count: number, id = "V1") => Array<string>(count).fill(id);

describe("BP14 Dragoncraft", () => {
  it("053 / 054 Si Long — Fanfare: a Tidal Tyranny, leader +2 with Overflow; evolved: the next Festive card costs 2 less", () => {
    const t = d({ me: { hand: ["BP14-053"], ...OVERFLOW } }).play("BP14-053");
    expect([t.ex(), t.leader()]).toEqual([["BP14-T04"], 22]);
    expect(d({ me: { hand: ["BP14-053"], playPoints: 3 } }).play("BP14-053").leader()).toBe(20);
    const evo = d({ me: { field: ["BP14-053"], evolveDeck: ["BP14-054"], hand: ["BP14-008", "V2"], playPoints: 1 } }).evolve("BP14-053");
    expect([evo.canPlay("BP14-008"), evo.canPlay("V2")]).toEqual([true, false]);
  });

  it("055 Sacred Springs Dragon — Rush, Assail; Fanfare: a Soothing Dragonspring from the deck; Strike: 2 divine water counters to draw and prevent the next damage", () => {
    const t = d({ me: { hand: ["BP14-055"], deck: [SPRING, "V1"], playPoints: 5 } }).play("BP14-055").pick(SPRING);
    expect([t.field(), t.counters(SPRING, WATER), t.keywords("BP14-055")]).toEqual([["BP14-055", SPRING], 10, ["rush", "assail"]]);
    const hit = d({ me: { field: ["BP14-055", spring(10)], deck: ["V1"] }, opp: { field: ["V5"] } }).attack("BP14-055", "opp:V5").yes();
    expect([hit.counters(SPRING, WATER), hit.hand(), hit.stats("BP14-055"), hit.field("opp")]).toEqual([8, ["V1"], [5, 5], []]);
    const dry = d({ me: { field: ["BP14-055", spring(1)], deck: ["V1"] }, opp: { field: ["V5"] } }).attack("BP14-055", "opp:V5");
    expect([dry.hand(), dry.field()]).toEqual([[], [SPRING]]);
  });

  it("056 / 057 Frostbite Dragon — Fanfare: engage up to 2; evolved: enemy followers don't refresh next time; Last Words: destroy each engaged enemy follower", () => {
    const t = d({ me: { hand: ["BP14-056"], playPoints: 7 }, opp: { field: ["V5", "V3", "V1"] } }).play("BP14-056").pick("opp:V5", "opp:V3");
    expect([t.engaged("opp:V5"), t.engaged("opp:V3"), t.engaged("opp:V1")]).toEqual([true, true, false]);
    const evo = d({ me: { field: ["BP14-056"], evolveDeck: ["BP14-057"], deck: n(2), playPoints: 1 }, opp: { field: [{ card: "V5", engaged: true }], deck: n(2) } });
    evo.evolve("BP14-056").end();
    expect(evo.engaged("opp:V5")).toBe(true);
    const lw = d({ me: { field: [{ card: "BP14-056", evolvedInto: "BP14-057" }], hand: ["QUICK-SAC"] }, opp: { field: [{ card: "V5", engaged: true }, "V3"] } }).play("QUICK-SAC");
    expect(lw.field("opp")).toEqual(["V3"]);
  });

  it("058 Dragonskull Bludgeoner — Fanfare: 3 damage with Overflow", () => {
    expect(d({ me: { hand: ["BP14-058"], ...OVERFLOW }, opp: { field: ["V5"] } }).play("BP14-058").stats("opp:V5")).toEqual([5, 2]);
    expect(d({ me: { hand: ["BP14-058"], playPoints: 1 }, opp: { field: ["V5"] } }).play("BP14-058").stats("opp:V5")).toEqual([5, 5]);
  });

  it("059 Soothing Dragonspring — 10 divine water counters; leader +1 once on your turn for a Festive follower; end phase: remove one, and with none left bury it and deal 5 to each enemy follower", () => {
    expect(d({ me: { hand: [SPRING], playPoints: 3 } }).play(SPRING).counters(SPRING, WATER)).toBe(10);
    // Elven Waitress: the Dragonspring's trigger and its own Fanfare (a cost, declined) are both pending.
    const t = d({ me: { field: [spring(10)], hand: ["BP14-008", "BP14-012"], playPoints: 4 } }).play("BP14-008").flush().no().play("BP14-012");
    expect(t.leader()).toBe(21);
    const end = d({ me: { field: [spring(10)], deck: n(2) }, opp: { field: ["V5"], deck: n(2) } }).end();
    expect([end.counters(SPRING, WATER), end.field("opp")]).toEqual([9, ["V5"]]);
    const last = d({ me: { field: [spring(1)], deck: n(2) }, opp: { field: ["V5", "V3"], deck: n(2) } }).end();
    expect([last.field(), last.cemetery(), last.field("opp")]).toEqual([[], [SPRING], []]);
  });

  it("060 / 061 Dragonfolk Stoker — evolved: 2 damage; act once per turn, 2 divine water counters: draw", () => {
    const t = d({ me: { field: ["BP14-060", spring(4)], evolveDeck: ["BP14-061"], deck: ["V1", "V2"], playPoints: 1 }, opp: { field: ["V5"] } }).evolve("BP14-060");
    expect(t.stats("opp:V5")).toEqual([5, 3]);
    t.activate("BP14-060");
    expect([t.hand(), t.counters(SPRING, WATER), t.canActivate("BP14-060")]).toEqual([["V1"], 2, false]);
    expect(d({ me: { field: [{ card: "BP14-060", evolvedInto: "BP14-061" }, spring(1)] } }).canActivate("BP14-060")).toBe(false);
  });

  it("062 Leviathan — Fanfare: an enemy follower doesn't refresh next time; end phase: 2 to an engaged enemy follower, 4 with Overflow", () => {
    const t = d({ me: { hand: ["BP14-062"], deck: n(2), playPoints: 4 }, opp: { field: [{ card: "V5", engaged: true }], deck: n(2) } }).play("BP14-062").end();
    expect([t.stats("opp:V5"), t.engaged("opp:V5")]).toEqual([[5, 3], true]);
    const over = d({ me: { field: ["BP14-062"], deck: n(2), ...OVERFLOW }, opp: { field: [{ card: "V5", engaged: true }, "V3"], deck: n(2) } }).end();
    expect([over.stats("opp:V5"), over.stats("opp:V3")]).toEqual([
      [5, 1],
      [3, 4],
    ]);
  });

  it("063 March of the Dragonspring — destroy and draw; 2 less for 2 divine water counters", () => {
    const t = d({ me: { hand: ["BP14-063"], field: [spring(3)], deck: ["V1"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP14-063");
    expect([t.field("opp"), t.hand(), t.counters(SPRING, WATER), t.pp()]).toEqual([[], ["V1"], 1, 0]);
    expect(d({ me: { hand: ["BP14-063"], field: [spring(1)], playPoints: 2 }, opp: { field: ["V5"] } }).canPlay("BP14-063")).toBe(false);
  });

  it("064 / 065 Dragon Breeder — evolved: a Dragoncraft follower (3 or less) from the top 4 into the EX area with +1/+1", () => {
    const t = d({ me: { field: ["BP14-064"], evolveDeck: ["BP14-065"], deck: ["V1", "BP14-058", "V3", "BP14-056"], playPoints: 3 } });
    t.evolve("BP14-064").pick("BP14-058").order();
    expect(t.ex()).toEqual(["BP14-058"]);
    expect(t.play("BP14-058@ex").stats("BP14-058")).toEqual([3, 3]);
  });

  it("066 Dragon-Drawn Carriage — Fanfare: a Festive card from the top 4 back on top, the rest to the bottom; act once per turn, 2 divine water counters: +1 attack and Storm", () => {
    const t = d({ me: { hand: ["BP14-066"], deck: ["V1", "BP14-012", "V3", "V5", "V2"], playPoints: 2 } }).play("BP14-066").pick("BP14-012").order();
    expect(t.zone("me", "deck")).toEqual(["BP14-012", "V2", "V1", "V3", "V5"]);
    const act = d({ me: { field: ["BP14-066", spring(2)] } }).activate("BP14-066");
    expect([act.stats("BP14-066"), act.keywords("BP14-066"), act.counters(SPRING, WATER)]).toEqual([[3, 3], ["storm"], 0]);
  });

  it("067 Loyal Sea Serpent — Ward; Fanfare (4): a Dragon; leader +2 for each Dragoncraft token follower put onto your field", () => {
    const t = d({ me: { hand: ["BP14-067"], playPoints: 6 } }).play("BP14-067").none().yes();
    expect([t.field(), t.leader(), t.pp()]).toEqual([["BP14-067", "BP01-T11"], 22, 0]);
    expect(d({ me: { hand: ["BP14-067"], playPoints: 6 } }).play("BP14-067").none().no().leader()).toBe(20);
  });

  it("068 Mermaid Song — engage it, it doesn't refresh next time, draw; 2 less for engaging a Marine follower", () => {
    const t = d({ me: { hand: ["BP14-068"], field: ["BP14-067"], deck: ["V1", "V1"], playPoints: 1 }, opp: { field: ["V5"], deck: n(2) } }).play("BP14-068");
    expect([t.engaged("BP14-067"), t.engaged("opp:V5"), t.hand()]).toEqual([true, true, ["V1"]]);
    t.end();
    expect(t.engaged("opp:V5")).toBe(true);
  });

  it("069 Aquatic Authority — a Marine card from the top 3 into the EX area, 1 less with Overflow", () => {
    const t = d({ me: { hand: ["BP14-069"], deck: ["V1", "BP14-067", "V3"], playPoints: 2, maxPlayPoints: 7 } }).play("BP14-069").pick("BP14-067").order();
    expect([t.ex(), t.canPlay("BP14-067@ex")]).toEqual([["BP14-067"], true]);
    const plain = d({ me: { hand: ["BP14-069"], deck: ["V1", "BP14-067", "V3"], playPoints: 2 } }).play("BP14-069").pick("BP14-067").order();
    expect(plain.canPlay("BP14-067@ex")).toBe(false);
  });

  it("T04 Tidal Tyranny — 4 damage, 6 with Overflow", () => {
    expect(d({ me: { ex: ["BP14-T04"], playPoints: 2 }, opp: { field: ["V5"] } }).play("BP14-T04@ex").stats("opp:V5")).toEqual([5, 1]);
    expect(d({ me: { ex: ["BP14-T04"], ...OVERFLOW }, opp: { field: ["V5"] } }).play("BP14-T04@ex").field("opp")).toEqual([]);
  });
});
