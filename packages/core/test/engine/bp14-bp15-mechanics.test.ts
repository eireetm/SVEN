import { describe, expect, it } from "vitest";
import { createEngine, script, type CardDefinition, type CardScript } from "../../src";
import { enemyFollower, hasLastWords, yourFollower } from "../../src/script/targets";
import { drive, testAmulet, testFollower, testSpell, type DriveSpec } from "../../src/testing";
import { mainActions, TEST_CARDS, TEST_SCRIPTS } from "../helpers";

// Engine behaviour added for BP14 / BP15, with synthetic cards. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5;
// KILL a 1-cost spell destroying an enemy follower; EVOLVER (2/2) has Evolve (2) into EVOLVER-E (4/4);
// LW-DRAW has Last Words; STACKER is an amulet with Stack.
const { defineCard, activated, spell, fanfare, delayedWhenPutIntoCemetery, changeStatsTo } = script;
const CARDS: CardDefinition[] = [
  testFollower("ADV-ACT", 1, 1, 1), // {[adv]} {[cost02]}: draw a card
  testSpell("WATCHER", 0), // 1 damage to an enemy follower; when it's put from the field into the cemetery this turn, draw
  testSpell("SHIELD-LEADER", 0), // your leader takes 1 less damage this turn
  testSpell("PING-ME", 0), // 3 damage to your leader
  testSpell("DREAM2", 0), // the top 2 cards into your EX area; the next of them you play costs 0
  testFollower("TAX", 1, 1, 1), // Fanfare: during the opponent's next turn, cards they play cost 1 more
  testSpell("RITE", 0), // Earth Rite: nothing
  testSpell("SET1", 0), // a follower on your field: change its attack and defense to 1
  testAmulet("STACKER", 1, { text: "Stack" }),
];
const SCRIPTS: Record<string, CardScript> = {
  STACKER: defineCard({ keywords: ["stack"] }),
  "ADV-ACT": defineCard({
    abilities: [
      activated(
        { playPoints: 2 },
        {
          advanced: true,
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
      ),
    ],
  }),
  WATCHER: defineCard({
    abilities: [
      spell({
        targets: [enemyFollower()],
        *resolve(fx) {
          const card = fx.targets[0]![0]!;
          yield* fx.dealDamage(card, 1);
          yield* fx.delay(1, "endOfTurn", { card });
        },
      }),
      delayedWhenPutIntoCemetery(function* (fx) {
        yield* fx.draw(1);
      }),
    ],
  }),
  "SHIELD-LEADER": defineCard({
    abilities: [spell({ *resolve(fx) { yield* fx.reduceDamage(fx.game.leader(fx.controller), 1, "endOfTurn"); } })],
  }),
  "PING-ME": defineCard({ abilities: [spell({ *resolve(fx) { yield* fx.dealDamage(fx.game.leader(fx.controller), 3); } })] }),
  DREAM2: defineCard({
    abilities: [
      spell({
        *resolve(fx) {
          for (const id of yield* fx.topToEx(2)) yield* fx.setPlayCost(id, 0, "endOfTurn", fx.self);
        },
      }),
    ],
  }),
  TAX: defineCard({
    abilities: [fanfare({ *resolve(fx) { yield* fx.restrictPlayer(fx.game.opponent(fx.controller), "playCostPlus1"); } })],
  }),
  RITE: defineCard({ abilities: [spell({ earthRite: { mode: "required" }, *resolve() {} })] }),
  SET1: defineCard({
    abilities: [
      spell({
        targets: [yourFollower()],
        *resolve(fx) {
          yield* changeStatsTo(fx, fx.targets[0]![0]!, { attack: 1, defense: 1 });
        },
      }),
    ],
  }),
};
const E = createEngine({ cards: [...TEST_CARDS, ...CARDS], scripts: { ...TEST_SCRIPTS, ...SCRIPTS } });
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP14 / BP15 mechanics", () => {
  it("CR 12.16.3 — an advanced activated ability may use 1 evolution point in lieu of 1 play point", () => {
    const t = d({ me: { field: ["ADV-ACT"], deck: ["V1", "V3"], playPoints: 2, evolutionPoints: 1 } });
    expect(mainActions(t.game).filter((a) => a.type === "activate").map((a) => a.type === "activate" && a.useEvolutionPoint === true)).toEqual([false, true]);
    t.activate("ADV-ACT", 0, { ep: true });
    expect([t.pp(), t.game.state.players[0].evolutionPoints, t.hand()]).toEqual([1, 0, ["V1"]]);
    // Without evolution points only the play point payment; with 1 play point only the other one.
    expect(mainActions(d({ me: { field: ["ADV-ACT"], playPoints: 2, evolutionPoints: 0 } }).game).filter((a) => a.type === "activate")).toHaveLength(1);
    const poor = d({ me: { field: ["ADV-ACT"], playPoints: 1, evolutionPoints: 1 } });
    expect(poor.canActivate("ADV-ACT")).toBe(true);
    expect(() => poor.activate("ADV-ACT")).toThrow(/not legal/);
    expect(poor.activate("ADV-ACT", 0, { ep: true }).pp()).toBe(0);
  });

  it("CR 12.16.3 / 8.3.2.1 — it is equivalent to an evolve ability: one of them per turn (BP14-018 ruling)", () => {
    const t = d({ me: { field: ["ADV-ACT", "EVOLVER"], evolveDeck: ["EVOLVER-E"], deck: ["V1"], playPoints: 4 } }).activate("ADV-ACT");
    expect([t.canEvolve("EVOLVER"), t.canActivate("ADV-ACT")]).toEqual([false, false]);
    const e = d({ me: { field: ["ADV-ACT", "EVOLVER"], evolveDeck: ["EVOLVER-E"], playPoints: 4 } }).evolve("EVOLVER");
    expect(e.canActivate("ADV-ACT")).toBe(false);
  });

  it("CR 10.7.5 — a delayed trigger that watches one card: when it's put from the field into the cemetery this turn", () => {
    const t = d({ me: { hand: ["WATCHER", "KILL"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5", "V3"] } });
    t.play("WATCHER").pick("opp:V5").play("KILL").pick("opp:V3");
    expect([t.hand(), t.stats("opp:V5")]).toEqual([[], [5, 4]]);
    const hit = d({ me: { hand: ["WATCHER", "KILL"], deck: ["V1"], playPoints: 1 }, opp: { field: ["V5", "V3"] } });
    hit.play("WATCHER").pick("opp:V5").play("KILL").pick("opp:V5");
    expect(hit.hand()).toEqual(["V1"]);
    // "this turn": gone at the end of the turn (CR 7.4.8).
    const end = d({ me: { hand: ["WATCHER"], deck: ["V1", "V1"] }, opp: { field: ["V5"], deck: ["V1"] } }).play("WATCHER").end();
    expect(end.game.state.delayed).toEqual([]);
  });

  it("CR 5.14.2 — a leader that takes that much minus 1 damage this turn (several add up)", () => {
    expect(d({ me: { hand: ["SHIELD-LEADER", "PING-ME"] } }).play("SHIELD-LEADER").play("PING-ME").leader()).toBe(18);
    expect(d({ me: { hand: ["SHIELD-LEADER", "SHIELD-LEADER", "PING-ME"] } }).play("SHIELD-LEADER").play("SHIELD-LEADER").play("PING-ME").leader()).toBe(19);
  });

  it("CR 10.4.4.1 — cards that share one \"costs 0\": the first of them played uses it up for the others (BP14-046)", () => {
    const t = d({ me: { hand: ["DREAM2"], deck: ["V3", "V5"] } }).play("DREAM2");
    expect([t.ex(), t.canPlay("V3@ex"), t.canPlay("V5@ex")]).toEqual([["V3", "V5"], true, true]);
    t.play("V3@ex");
    expect([t.field(), t.canPlay("V5@ex")]).toEqual([["V3"], false]);
  });

  it("an opponent's cards cost 1 more during their next turn only (BP15-058)", () => {
    const t = d({ me: { hand: ["TAX"], playPoints: 1, deck: ["V1", "V1"] }, opp: { hand: ["V1", "V3"], deck: ["V1", "V1"], maxPlayPoints: 1 } });
    t.play("TAX").end();
    // The opponent has 2 play points: V1 costs 2, V3 costs 4.
    expect([t.canPlay("opp:V1"), t.canPlay("opp:V3")]).toEqual([true, false]);
    t.play("opp:V1");
    expect(t.pp("opp")).toBe(0);
  });

  it("CR 13.3.3.2 — Stack counters removed by Earth Rite this turn are counted (BP14-037)", () => {
    const t = d({ me: { hand: ["RITE"], field: [{ card: "STACKER", counters: { stack: 2 } }] } }).play("RITE");
    expect(t.game.reader().stackRemovedByEarthRiteThisTurn(0)).toBe(1);
  });

  it("CR 5.14.1 / 5.16.2.1 — \"change its attack and defense to 1\" is the difference, kept after it evolves (BP15-014 ruling)", () => {
    expect(d({ me: { hand: ["SET1"], field: [{ card: "V5", damage: 2 }] } }).play("SET1").stats("V5")).toEqual([1, 1]);
    const evo = d({ me: { hand: ["SET1"], field: ["EVOLVER"], evolveDeck: ["EVOLVER-E"], playPoints: 2 } }).play("SET1").evolve("EVOLVER");
    expect(evo.stats("EVOLVER")).toEqual([3, 3]);
  });

  it("a card with Last Words (BP15-082)", () => {
    const t = d({ me: { cemetery: ["LW-DRAW", "V1"] } });
    const g = t.game.reader();
    expect([hasLastWords(g, t.id("LW-DRAW")), hasLastWords(g, t.id("V1"))]).toEqual([true, false]);
  });
});
