import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP02 Dragoncraft (052–068) and its tokens Hellflame Dragon (T06), Draconic Weapon (T07).
// "V1".."V5" are vanilla test followers (cost N, V1 = 2/2, V2 = 2/3, V3 = 3/4, V5 = 5/5).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const DRAGON = "BP01-T11";
const HELLFLAME = "BP02-T06";

describe("BP02 Dragoncraft", () => {
  it("052 / 053 Imperial Dragoon — X damage to each enemy (X = cards in hand), then discard your hand; evolved draws 3", () => {
    const t = d({ me: { hand: ["BP02-052", "V1", "V2", "V3"], playPoints: 8 }, opp: { field: ["V3", "V5"] } }).play("BP02-052");
    expect([t.leader("opp"), t.stats("opp:V3"), t.stats("opp:V5"), t.hand(), t.cemetery()]).toEqual([
      17,
      [3, 1],
      [5, 2],
      [],
      ["V1", "V2", "V3"],
    ]);
    const evo = d({ me: { field: ["BP02-052"], evolveDeck: ["BP02-053"], deck: ["V1", "V1", "V1"], playPoints: 1 } }).evolve("BP02-052");
    expect(evo.hand()).toHaveLength(3);
  });

  it("054 Dragonsong Flute — optional 3-PP fanfare; with Overflow, discard for a Hellflame Dragon; discarded: another one", () => {
    const paid = d({ me: { hand: ["BP02-054"], deck: ["V1"], playPoints: 4 } }).play("BP02-054").yes();
    expect([paid.field(), paid.hand(), paid.pp()]).toEqual([["BP02-054", HELLFLAME], ["V1"], 0]);
    const declined = d({ me: { hand: ["BP02-054"], deck: ["V1"], playPoints: 4 } }).play("BP02-054").no();
    expect([declined.field(), declined.pp()]).toEqual([["BP02-054"], 3]);
    const act = d({ me: { field: ["BP02-054"], hand: ["BP02-054"], playPoints: 1, maxPlayPoints: 7 } }).activate("BP02-054");
    expect([act.ex(), act.cemetery()]).toEqual([[HELLFLAME, HELLFLAME], ["BP02-054"]]);
    expect(d({ me: { field: ["BP02-054"], hand: ["V1"], maxPlayPoints: 6 } }).canActivate("BP02-054")).toBe(false);
  });

  it("055 / 056 Neptune — Ward; a Megalorca; your Megalorcas have Rush (evolved: Storm)", () => {
    const t = d({ me: { hand: ["BP02-055"], playPoints: 5 } }).play("BP02-055").none();
    expect([t.field(), t.keywords("BP02-T05")]).toEqual([["BP02-055", "BP02-T05"], ["rush"]]);
    const evo = d({ me: { field: ["BP02-055"], evolveDeck: ["BP02-056"], playPoints: 2 } }).evolve("BP02-055");
    expect(evo.keywords("BP02-T05")).toEqual(["storm"]);
  });

  it("057 Draconic Fervor — maximum PP +1 (current PP unchanged), leader +3, draw", () => {
    const t = d({ me: { hand: ["BP02-057"], deck: ["V1"], playPoints: 5, maxPlayPoints: 5 } }).play("BP02-057");
    expect([t.pp(), t.game.state.players[0].maxPlayPoints, t.leader(), t.hand()]).toEqual([0, 6, 23, ["V1"]]);
  });

  it("058 Polyphonic Roar — once on each of your turns, a Dragon token entering deals 5", () => {
    const t = d({ me: { field: ["BP02-058", "BP01-078", "BP01-078"], ex: [DRAGON, DRAGON], playPoints: 4 }, opp: { field: ["V5"] } });
    t.activate("BP01-078").pick(DRAGON).pick("opp:leader"); // Zirnitra puts a Dragon from EX onto the field
    expect(t.leader("opp")).toBe(15);
    t.activate("BP01-078");
    expect([t.leader("opp"), t.field()]).toEqual([15, ["BP02-058", "BP01-078", "BP01-078", DRAGON, DRAGON]]);
  });

  it("059 / 060 Siegfried — 2 damage; evolved destroys an enemy follower whose current defense is 3 or less", () => {
    expect(d({ me: { hand: ["BP02-059"], playPoints: 4 }, opp: { field: ["V5"] } }).play("BP02-059").stats("opp:V5")).toEqual([5, 3]);
    const evo = d({ me: { field: ["BP02-059"], evolveDeck: ["BP02-060"], playPoints: 1 }, opp: { field: [{ card: "V5", damage: 2 }, "V5"] } });
    expect(evo.evolve("BP02-059").stats("opp:V5")).toEqual([5, 5]); // the damaged one was destroyed
    expect(evo.field("opp")).toEqual(["V5"]);
  });

  it("061 Transmogrified Wyrm — a card in either EX area becomes a Dragon token", () => {
    const t = d({ me: { hand: ["BP02-061"], ex: ["V1"], playPoints: 4 }, opp: { ex: ["V5"] } }).play("BP02-061").pick("opp:V5");
    expect([t.ex(), t.ex("opp")]).toEqual([["V1"], [DRAGON]]);
  });

  it("062 Dracomancer's Rites — discard for leader +1; at your end phase, 2 damage if you discarded this turn", () => {
    const t = d({ me: { hand: ["BP02-062", "V1"], playPoints: 3 }, opp: { field: ["V5"], deck: ["V1"] } }).play("BP02-062").yes();
    expect([t.leader(), t.cemetery()]).toEqual([21, ["V1"]]);
    t.end().pick("opp:V5");
    expect(t.stats("opp:V5")).toEqual([5, 3]);
    const none = d({ me: { hand: ["BP02-062", "V1"], playPoints: 3 }, opp: { field: ["V5"], deck: ["V1"] } }).play("BP02-062").no().end();
    expect(none.stats("opp:V5")).toEqual([5, 5]);
  });

  it("063 Wildfang Dragonewt — costs 2 less once you have discarded a card this turn", () => {
    const t = d({ me: { hand: ["BP02-046", "BP02-063"], deck: ["V1"], playPoints: 3 } });
    expect(t.canPlay("BP02-063")).toBe(true);
    t.play("BP02-046").pick("V1"); // Craig: draw, then discard
    expect([t.pp(), t.canPlay("BP02-063")]).toEqual([1, true]);
    expect(d({ me: { hand: ["BP02-063"], playPoints: 2 } }).canPlay("BP02-063")).toBe(false);
  });

  it("064 Mushussu — +2 attack whenever one of your followers evolves", () => {
    const t = d({ me: { field: ["BP02-064", "EVOLVER"], evolveDeck: ["EVOLVER-E"], playPoints: 2 } }).evolve("EVOLVER");
    expect(t.stats("BP02-064")).toEqual([4, 3]);
  });

  it("065 / 066 Dragontamer — evolved: discard a card to return a Wyrmkin follower from your cemetery (target first)", () => {
    const t = d({ me: { field: ["BP02-065"], evolveDeck: ["BP02-066"], hand: ["V1"], cemetery: ["BP02-059"], playPoints: 1 } });
    t.evolve("BP02-065").yes();
    expect([t.hand(), t.cemetery()]).toEqual([["BP02-059"], ["V1"]]);
    const none = d({ me: { field: ["BP02-065"], evolveDeck: ["BP02-066"], hand: ["V1"], cemetery: ["V5"], playPoints: 1 } }).evolve("BP02-065");
    expect(none.hand()).toEqual(["V1"]); // no target: the cost is not even offered
  });

  it("067 Twin-Headed Dragon — double attack damage to leaders and double combat damage; 3 PP for a Dragon token", () => {
    expect(d({ me: { field: ["BP02-067"] } }).attack("BP02-067", "opp:leader").leader("opp")).toBe(16);
    const fight = d({ me: { field: ["BP02-067"] }, opp: { field: [{ card: "V5", engaged: true }] } }).attack("BP02-067", "opp:V5");
    expect(fight.stats("opp:V5")).toEqual([5, 1]);
    const defend = d({ turn: 6, me: { field: [{ card: "BP02-067", engaged: true }] }, opp: { field: ["V3"] } }).attack("opp:V3", "BP02-067");
    expect([defend.field("opp"), defend.stats("BP02-067")]).toEqual([[], [2, 2]]);
    expect(d({ me: { hand: ["BP02-067"], playPoints: 7 } }).play("BP02-067").yes().field()).toEqual(["BP02-067", DRAGON]);
  });

  it("068 Draconic Armor / T07 Draconic Weapon — 1 or 2 (Overflow) Weapons; a Weapon gives +1 defense and the Armed trait", () => {
    expect(d({ me: { hand: ["BP02-068"], playPoints: 1 } }).play("BP02-068").field()).toEqual(["BP02-T07"]);
    expect(d({ me: { hand: ["BP02-068"], playPoints: 1, maxPlayPoints: 7 } }).play("BP02-068").field()).toEqual(["BP02-T07", "BP02-T07"]);
    const t = d({ me: { field: ["BP02-T07", "BP02-059"] } }).activate("BP02-T07");
    expect([t.field(), t.stats("BP02-059"), t.game.reader().info(t.id("BP02-059")).traits]).toEqual([["BP02-059"], [3, 4], ["竜族", "キラー", "武装"]]);
  });
});
