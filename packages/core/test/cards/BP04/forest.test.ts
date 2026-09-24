import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP04 Forestcraft (001–019). V1 is 1c 2/2, V2 2c 2/3, V3 3c 3/4, V5 5c 5/5 (Neutral).
// BP04-015 Fita (2/1) and BP04-010 Sukuna (1/1) serve as Forestcraft followers.
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const FAIRY = "BP01-T03";
const WISP = "BP01-T02";

describe("BP04 Forestcraft", () => {
  it("001 Cassiopeia — X divided among any number of enemy followers, at least 1 each; X is hand plus EX", () => {
    // After playing it: 1 card in hand + 2 in EX = 3.
    const t = d({ me: { hand: ["BP04-001", "V1"], ex: ["V1", "V2"], playPoints: 5 }, opp: { field: ["V5", "V3", "V2"] } });
    t.play("BP04-001");
    expect(t.decision).toMatchObject({ type: "selectCards", min: 0, max: 3 });
    t.pick("opp:V5", "opp:V3").choose("2"); // 2 to V5, the remaining 1 to V3
    expect([t.stats("opp:V5"), t.stats("opp:V3"), t.stats("opp:V2")]).toEqual([[5, 3], [3, 3], [2, 3]]);
    // Selecting none is allowed (ruling); X = 1 allows only one follower.
    const none = d({ me: { hand: ["BP04-001"], ex: ["V1"], playPoints: 5 }, opp: { field: ["V5", "V3"] } }).play("BP04-001");
    expect(none.decision).toMatchObject({ type: "selectCards", min: 0, max: 1 });
    none.none();
    expect(none.stats("opp:V5")).toEqual([5, 5]);
  });

  it("003 / 004 Deepwood Anomaly — attack damage to the enemy leader wins; evolved puts a follower on the deck bottom", () => {
    const win = d({ me: { field: ["BP04-003"] } });
    win.attack("BP04-003", "opp:leader");
    expect(win.game.state.result).toMatchObject({ winner: 0, losses: [{ player: 1, reason: "effect" }] });
    const follower = d({ me: { field: ["BP04-003"] }, opp: { field: [{ card: "V1", engaged: true }] } });
    follower.attack("BP04-003", "opp:V1");
    expect(follower.game.state.result).toBeNull();

    const evo = d({ me: { field: ["BP04-003"], evolveDeck: ["BP04-004"], playPoints: 1 }, opp: { field: ["V5"], deck: ["V1"] } });
    evo.evolve("BP04-003");
    expect([evo.field("opp"), evo.zone("opp", "deck"), evo.stats("BP04-003")]).toEqual([[], ["V1", "V5"], [10, 10]]);
    evo.attack("BP04-003", "opp:leader");
    expect(evo.game.state.result?.winner).toBe(0);
  });

  it("005 / 006 King Elephant — return any number of your cards, +X/+X for the hand; evolved ignores Ward", () => {
    const t = d({ me: { hand: ["BP04-005", "V1"], field: ["V2", "AMULET", FAIRY], playPoints: 6 } });
    t.play("BP04-005").pick("V2", FAIRY);
    // Hand: V1 + V2; the Fairy token is removed and not counted (ruling).
    expect([t.hand(), t.stats("BP04-005"), t.field(), t.keywords("BP04-005")]).toEqual([
      ["V1", "V2"],
      [3, 3],
      ["AMULET", "BP04-005"],
      ["storm"],
    ]);
    expect(t.attackTargets("BP04-005")).toEqual(["opp:leader"]);
    // Returning itself is allowed; then it gets nothing (ruling).
    const self = d({ me: { hand: ["BP04-005"], playPoints: 6 } }).play("BP04-005").pick("BP04-005");
    expect([self.hand(), self.field()]).toEqual([["BP04-005"], []]);

    const evo = d({
      me: { field: ["BP04-005"], evolveDeck: ["BP04-006"], hand: ["V1", "V2"], playPoints: 4 },
      opp: { field: [{ card: "WARD", engaged: true }, { card: "V5", engaged: true }] },
    });
    expect(evo.attackTargets("BP04-005")).toEqual(["WARD"]);
    evo.evolve("BP04-005");
    expect([evo.stats("BP04-005"), evo.attackTargets("BP04-005")]).toEqual([
      [3, 3],
      ["WARD", "V5", "opp:leader"],
    ]);
  });

  it("007 Fashionista Nelcha — engage; with Combo (3), +2/+2 to another follower or -2/-2 to an enemy", () => {
    const setup = { me: { hand: ["V1", "V1", "V1"], field: ["BP04-007", "V3"], playPoints: 3 }, opp: { field: ["V5"] } };
    const weaken = d(setup);
    weaken.play("V1").play("V1").play("V1").activate("BP04-007").choose("weaken");
    expect(weaken.stats("opp:V5")).toEqual([3, 3]);
    const buff = d(setup);
    buff.play("V1").play("V1").play("V1").activate("BP04-007").choose("buff").pick("V3");
    expect(buff.stats("V3")).toEqual([5, 6]);
    // An enemy with Aura cannot be selected, so only the buff is offered (and chosen at once).
    const aura = d({ ...setup, opp: { field: ["BP03-001"] } });
    aura.play("V1").play("V1").play("V1").activate("BP04-007").pick("V3");
    expect(aura.stats("V3")).toEqual([5, 6]);
    // Without Combo (3) it can be activated and does nothing.
    const early = d({ me: { field: ["BP04-007", "V3"] }, opp: { field: ["V5"] } }).activate("BP04-007");
    expect([early.engaged("BP04-007"), early.stats("V3"), early.stats("opp:V5")]).toEqual([true, [3, 4], [5, 5]]);
  });

  it("008 Spring-Green Protection — +0/+1 (+1/+0 more with Combo 3) to a Forestcraft follower; leaving leaves a Fairy Wisp", () => {
    const t = d({ me: { field: ["BP04-008", "BP04-015", "BP04-010", "V3"], playPoints: 1 } });
    t.activate("BP04-008").pick("BP04-015");
    expect([t.stats("BP04-015"), t.field(), t.ex(), t.cemetery()]).toEqual([[2, 2], ["BP04-015", "BP04-010", "V3"], [WISP], ["BP04-008"]]);
    const combo = d({ me: { hand: ["V1", "V1", "V1"], field: ["BP04-008", "BP04-015"], playPoints: 4 } });
    combo.play("V1").play("V1").play("V1").activate("BP04-008");
    expect(combo.stats("BP04-015")).toEqual([3, 2]);
  });

  it("010 / 011 Sukuna — evolve; Storm, and +1/+1 at Combo 3 or +3/+3 at Combo 5 (evolving is not playing)", () => {
    const three = d({ me: { hand: ["V1", "V1", "V1"], field: ["BP04-010"], evolveDeck: ["BP04-011"], playPoints: 4 } });
    three.play("V1").play("V1").play("V1").evolve("BP04-010");
    expect([three.stats("BP04-010"), three.keywords("BP04-010")]).toEqual([[3, 3], ["storm"]]);
    const spells = ["GIVE-STORM", "GIVE-STORM", "GIVE-STORM", "GIVE-STORM", "GIVE-STORM"];
    const five = d({ me: { hand: spells, field: ["BP04-010"], evolveDeck: ["BP04-011"], playPoints: 1 } });
    for (let i = 0; i < 5; i++) five.play("GIVE-STORM");
    five.evolve("BP04-010");
    expect(five.stats("BP04-010")).toEqual([5, 5]);
    const none = d({ me: { field: ["BP04-010"], evolveDeck: ["BP04-011"], playPoints: 1 } }).evolve("BP04-010");
    expect(none.stats("BP04-010")).toEqual([2, 2]);
  });

  it("012 Dolorblade Demon — 1 damage to the enemy leader and each enemy follower, on entering and on leaving", () => {
    const t = d({ me: { hand: ["BP04-012", "QUICK-SAC"], playPoints: 4 }, opp: { field: ["V5", "V1"] } });
    t.play("BP04-012");
    expect([t.leader("opp"), t.stats("opp:V5"), t.stats("opp:V1")]).toEqual([19, [5, 4], [2, 1]]);
    t.play("QUICK-SAC");
    expect([t.leader("opp"), t.stats("opp:V5"), t.field("opp")]).toEqual([18, [5, 3], ["V5"]]);
  });

  it("013 Elf Song — a Fairy; Combo (3) gives each Forestcraft follower +1/+1, the new Fairy too; playable with a full field", () => {
    const t = d({ me: { hand: ["V1", "V1", "BP04-013"], field: ["BP04-015"], playPoints: 4 } });
    t.play("V1").play("V1").play("BP04-013");
    expect([t.stats("BP04-015"), t.stats(FAIRY), t.stats("V1")]).toEqual([[3, 2], [2, 2], [2, 2]]);
    const plain = d({ me: { hand: ["BP04-013"], playPoints: 2 } }).play("BP04-013");
    expect(plain.stats(FAIRY)).toEqual([1, 1]);
    const full = d({ me: { hand: ["BP04-013"], field: ["BP04-015", "V1", "V1", "V1", "V1"], playPoints: 2 } });
    expect(full.canPlay("BP04-013")).toBe(true);
  });

  it("014 Starry Elf — search an amulet", () => {
    const t = d({ me: { hand: ["BP04-014"], deck: ["V1", "AMULET"], playPoints: 3 } });
    t.play("BP04-014").pick("AMULET");
    expect(t.hand()).toEqual(["AMULET"]);
  });

  it("015 / 016 Fita the Gentle Elf — evolve: leader +1 and a draw", () => {
    const t = d({ me: { field: ["BP04-015"], evolveDeck: ["BP04-016"], deck: ["V1"], playPoints: 1 } }).evolve("BP04-015");
    expect([t.leader(), t.hand(), t.stats("BP04-015")]).toEqual([21, ["V1"], [3, 2]]);
  });

  it("017 Dryad — Strike gives an enemy follower -1 attack", () => {
    const t = d({ me: { field: ["BP04-017"] }, opp: { field: ["V5", "V1"] } });
    t.attack("BP04-017", "opp:leader").pick("opp:V5");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[4, 5], 18]);
  });

  it("018 Beetle Warrior — Combo (3): +1/+1 and Storm", () => {
    const t = d({ me: { hand: ["V1", "V1", "BP04-018"], playPoints: 5 } });
    t.play("V1").play("V1").play("BP04-018");
    expect([t.stats("BP04-018"), t.keywords("BP04-018"), t.attackTargets("BP04-018")]).toEqual([[4, 5], ["storm"], ["opp:leader"]]);
    const plain = d({ me: { hand: ["BP04-018"], playPoints: 3 } }).play("BP04-018");
    expect([plain.stats("BP04-018"), plain.keywords("BP04-018")]).toEqual([[3, 4], []]);
  });

  it("019 Ivy Spellbomb — 5 damage; Combo (3) adds 3 to its leader; needs an enemy follower", () => {
    const t = d({ me: { hand: ["V1", "V1", "BP04-019"], playPoints: 5 }, opp: { field: ["V5"] } });
    t.play("V1").play("V1").play("BP04-019");
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 17]);
    const plain = d({ me: { hand: ["BP04-019"], playPoints: 3 }, opp: { field: ["V5"] } }).play("BP04-019");
    expect([plain.field("opp"), plain.leader("opp")]).toEqual([[], 20]);
    expect(d({ me: { hand: ["BP04-019"], playPoints: 3 } }).canPlay("BP04-019")).toBe(false);
  });
});
