import { describe, expect, it } from "vitest";
import { drive, type DriveSpec } from "../../../src/testing";
import { cardEngine } from "../../helpers";

// BP01 Runecraft (051–075) and tokens T08 Strikeform Golem, T09 Guardform Golem, T10 Magic
// Sediment. Spells used as filler: BP01-071 Wind Blast (1), BP01-064 Alchemical Lore (5).
const E = cardEngine();
const d = (spec: DriveSpec) => drive(E, spec);
const SEDIMENT = "BP01-T10";
const GUARDFORM = "BP01-T09";
const spells = (n: number) => Array<string>(n).fill("BP01-071");

describe("BP01 Runecraft", () => {
  it("051 Erasmus — Earth Rite: 6 to a follower and 2 to its leader; the emptied Stack amulet leaves", () => {
    const t = d({ me: { hand: ["BP01-051"], field: [SEDIMENT], playPoints: 7 }, opp: { field: ["V5"] } });
    t.play("BP01-051").yes();
    expect(t.field("opp")).toEqual([]);
    expect(t.leader("opp")).toBe(18);
    expect(t.field()).toEqual(["BP01-051"]); // Magic Sediment lost its last counter (CR 13.3.3.2)
    expect(t.canActivate("BP01-051")).toBe(false); // no Stack left for the act's Earth Rite
  });

  it("052 Merlin — search a spell", () => {
    const t = d({ me: { hand: ["BP01-052"], deck: ["V1", "BP01-071"], playPoints: 3 } }).play("BP01-052").pick("BP01-071");
    expect(t.hand()).toEqual(["BP01-071"]);
  });

  it("053 Merlin (Evolved) — play a spell of cost 3 or less from the cemetery for 0", () => {
    const t = d({ me: { field: ["BP01-052"], evolveDeck: ["BP01-053"], cemetery: ["BP01-071", "BP01-064"], playPoints: 2 }, opp: { field: ["V3"] } });
    t.evolve("BP01-052");
    expect(t.stats("opp:V3")).toEqual([3, 2]);
    expect(t.pp()).toBe(0);
    expect(t.cemetery()).toEqual(["BP01-064", "BP01-071"]);
    // A spell that can't be played (Wind Blast without a target) is still selected: nothing happens.
    const none = d({ me: { field: ["BP01-052"], evolveDeck: ["BP01-053"], cemetery: ["BP01-071"], playPoints: 2 } }).evolve("BP01-052");
    expect([none.cemetery(), none.decision?.type]).toEqual([["BP01-071"], "mainPhase"]);
  });

  it("054 / 055 Ancient Alchemist — Earth Rite: 2 Guardform Golems to EX; evolved: Golems cost 1 less and deal 3 on entering", () => {
    const t = d({ me: { hand: ["BP01-054"], field: [SEDIMENT], playPoints: 3 } }).play("BP01-054").yes();
    expect(t.ex()).toEqual([GUARDFORM, GUARDFORM]);
    const evo = d({
      me: { field: [{ card: "BP01-054", evolvedInto: "BP01-055" }], ex: [GUARDFORM], playPoints: 1 },
      opp: { field: ["V3"] },
    });
    evo.play(GUARDFORM).none().pick("opp:V3"); // cost 2 - 1; stays reserved; 3 damage to V3
    expect(evo.stats("opp:V3")).toEqual([3, 1]);
  });

  it("056 Arcane Enlightenment — fill the EX area from the deck; banish it at your next end phase", () => {
    const t = d({ me: { hand: ["BP01-056"], ex: ["V1", "V1"], deck: ["V2", "V3", "V5", "V1"], playPoints: 4 }, opp: { deck: ["V1"] } });
    t.play("BP01-056");
    expect(t.ex()).toEqual(["V1", "V1", "V2", "V3", "V5"]);
    t.end();
    expect(t.ex()).toEqual([]);
    expect(t.zone("me", "banished")).toHaveLength(5);
  });

  it("057 Dimension Shift — banish 10 spells to play it for 7; take another turn", () => {
    const t = d({ me: { hand: ["BP01-057"], cemetery: spells(10), deck: ["V1"], playPoints: 7 }, opp: { deck: ["V1"] } });
    t.play("BP01-057");
    expect(t.zone("me", "banished")).toHaveLength(10);
    t.end();
    expect(t.game.state.activePlayer).toBe(0);
    expect(t.game.state.turn).toBe(6);
  });

  it("058 Juno's Secret Laboratory — fanfare golem; acts: Magic Sediment, Earth Rite golem", () => {
    const t = d({ me: { hand: ["BP01-058"], playPoints: 5 } }).play("BP01-058").choose("Strikeform Golem");
    expect(t.field()).toEqual(["BP01-058", "BP01-T08"]);
    t.activate("BP01-058", 0);
    expect(t.counters(SEDIMENT, "stack")).toBe(1);
  });

  it("059 / 060 Spectral Wizard — take a spell from the top; evolved: discard a spell for 4 damage", () => {
    const t = d({ me: { hand: ["BP01-059"], deck: ["BP01-071"], playPoints: 2 } }).play("BP01-059").pick("BP01-071");
    expect(t.hand()).toEqual(["BP01-071"]);
    const evo = d({ me: { field: ["BP01-059"], evolveDeck: ["BP01-060"], hand: ["BP01-071"], playPoints: 2 }, opp: { field: ["V5"] } });
    evo.evolve("BP01-059").yes();
    expect(evo.stats("opp:V5")).toEqual([5, 1]);
    expect(evo.cemetery()).toEqual(["BP01-071"]);
  });

  it("061 Flame Destroyer — Spellchain lowers its cost by 3 / 6 / 9", () => {
    expect(d({ me: { hand: ["BP01-061"], cemetery: spells(5), playPoints: 6 } }).canPlay("BP01-061")).toBe(true);
    expect(d({ me: { hand: ["BP01-061"], cemetery: spells(4), playPoints: 6 } }).canPlay("BP01-061")).toBe(false);
    expect(d({ me: { hand: ["BP01-061"], cemetery: spells(15), playPoints: 0 } }).canPlay("BP01-061")).toBe(true);
  });

  it("062 Dragonbond Mage — a spell counter per spell played; remove 3 for 5 damage", () => {
    const t = d({ me: { field: ["BP01-062"], hand: spells(3), playPoints: 3 }, opp: { field: ["V1", "V5"] } });
    t.play("BP01-071").pick("opp:V5").play("BP01-071").pick("opp:V5").play("BP01-071").pick("opp:V1");
    expect(t.counters("BP01-062", "spell")).toBe(3);
    t.activate("BP01-062");
    expect(t.field("opp")).toEqual([]);
  });

  it("063 Golem Protection — 2 Guardform Golems; Earth Rite: Golems +1/+1", () => {
    const t = d({ me: { hand: ["BP01-063"], field: [SEDIMENT], playPoints: 4 } }).play("BP01-063").yes().none();
    expect(t.field()).toEqual([GUARDFORM, GUARDFORM]);
    expect(t.stats(GUARDFORM)).toEqual([3, 4]);
  });

  it("064 Alchemical Lore / 071 Wind Blast — 4 to each enemy follower; 2 (SC10: 4) to one", () => {
    const t = d({ me: { hand: ["BP01-064"], field: ["V5"], playPoints: 5 }, opp: { field: ["V3", "V5"] } }).play("BP01-064");
    expect(t.field("opp")).toEqual(["V5"]);
    expect(t.stats("V5")).toEqual([5, 5]);
    const sc = d({ me: { hand: ["BP01-071"], cemetery: spells(10), playPoints: 1 }, opp: { field: ["V5"] } }).play("BP01-071");
    expect(sc.stats("opp:V5")).toEqual([5, 1]);
  });

  it("065 Fate's Hand — draw 2; Spellchain (10) recovers 1 play point", () => {
    const t = d({ me: { hand: ["BP01-065"], deck: ["V1", "V2"], cemetery: spells(10), playPoints: 3, maxPlayPoints: 4 } }).play("BP01-065");
    expect(t.hand()).toEqual(["V1", "V2"]);
    expect(t.pp()).toBe(1);
  });

  it("066 Price of Magic — Stack; banish an enemy follower with 4 defense or less", () => {
    const t = d({ me: { hand: ["BP01-066"], playPoints: 3 }, opp: { field: ["V5", "V3"] } }).play("BP01-066");
    expect(t.field("opp")).toEqual(["V5"]);
    expect(t.zone("opp", "banished")).toEqual(["V3"]);
    expect(t.counters("BP01-066", "stack")).toBe(1);
  });

  it("Stack — leaving the field removes a counter instead; with none left it goes to the cemetery (13.3.2, 11.7)", () => {
    const t = d({ me: { hand: ["BP01-015"], field: ["BP01-066"], deck: ["V1"], playPoints: 1 } }).play("BP01-015");
    expect(t.hand()).toEqual(["V1"]); // not returned: a counter was removed instead
    expect(t.cemetery()).toEqual(["BP01-015", "BP01-066"]); // 0 counters -> rules handling 11.7
  });

  it("Stack — act: move all Stack counters to another Stack amulet", () => {
    const t = d({ me: { field: [SEDIMENT, { card: "BP01-066", counters: { stack: 2 } }] } });
    t.activate("BP01-066");
    expect(t.field()).toEqual([SEDIMENT]);
    expect(t.counters(SEDIMENT, "stack")).toBe(3);
  });

  it("067 Runic Guardian — (1) Earth Rite +1/+2 only when payable, else (2) Magic Sediment", () => {
    const t = d({ me: { hand: ["BP01-067"], field: [SEDIMENT], playPoints: 3 } }).play("BP01-067").none().choose("1");
    expect(t.stats("BP01-067")).toEqual([4, 6]);
    const none = d({ me: { hand: ["BP01-067"], playPoints: 3 } }).play("BP01-067").none();
    expect(none.field()).toEqual(["BP01-067", SEDIMENT]);
  });

  it("068 / 069 Crafty Warlock — Last Words Magic Sediment; evolved also adds 1 to a Stack", () => {
    const t = d({ me: { field: [{ card: "BP01-068", evolvedInto: "BP01-069", damage: 3 }], hand: ["V1"], playPoints: 1 } });
    t.play("V1"); // the Warlock dies; its Last Words summon a Sediment and add 1 to it (the only Stack)
    expect(t.counters(SEDIMENT, "stack")).toBe(2);
  });

  it("070 Lightning Shooter — 2 damage; SC5 4; SC10 also 2 to that follower's leader", () => {
    const t = d({ me: { hand: ["BP01-070"], cemetery: spells(10), playPoints: 4 }, opp: { field: ["V5"] } }).play("BP01-070");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 1], 18]);
  });

  it("072 Sorcery Cache — a spell to hand, a spell to the cemetery, the rest to the bottom", () => {
    const t = d({ me: { hand: ["BP01-072"], deck: ["BP01-071", "V1", "BP01-064", "V2", "V3"], playPoints: 2 } });
    t.play("BP01-072").pick("BP01-064").pick("BP01-071").order("V2", "V1");
    expect(t.hand()).toEqual(["BP01-064"]);
    expect(t.cemetery()).toEqual(["BP01-071", "BP01-072"]);
    expect(t.zone("me", "deck")).toEqual(["V3", "V2", "V1"]);
  });

  it("073 Fiery Embrace — destroy; SC10 also 3 to that follower's leader", () => {
    const t = d({ me: { hand: ["BP01-073"], cemetery: spells(10), playPoints: 4 }, opp: { field: ["V5"] } }).play("BP01-073");
    expect([t.field("opp"), t.leader("opp")]).toEqual([[], 17]);
  });

  it("074 / 075 Workshop and Teachings — Stack amulets: Strikeform Golem (Rush) / draw", () => {
    const t = d({ me: { hand: ["BP01-074", "BP01-075"], deck: ["V1"], playPoints: 3 } }).play("BP01-074").play("BP01-075");
    expect(t.field()).toEqual(["BP01-074", "BP01-T08", "BP01-075"]);
    expect(t.keywords("BP01-T08")).toEqual(["rush"]);
    expect([t.counters("BP01-074", "stack"), t.counters("BP01-075", "stack")]).toEqual([1, 1]);
    expect(t.hand()).toEqual(["V1"]);
  });
});
