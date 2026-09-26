import { describe, expect, it } from "vitest";
import { createEngine, script, type CardDefinition, type CardScript } from "../../src";
import { enemyFollower, yourFollower } from "../../src/script/targets";
import { drive, testAmulet, testFollower, testSpell, type DriveSpec } from "../../src/testing";
import { TEST_CARDS, TEST_SCRIPTS } from "../helpers";

// Engine behaviour added for BP11 / BP12, with synthetic cards. V1 is 1c 2/2, V5 5c 5/5, WARD 2c
// 1/3 with Ward; EVOLVER (Evolve [2]) evolves into EVOLVER-E 4/4.
const { defineCard, activated, spell, whenThisGainsStats, whenYourCardLeaves, whenYouDiscardAny, whenAnyPlayerDiscards } = script;
const MOUNT = "乗物";
const vehicle = (id: string, o: { traits?: string[] } = {}): CardDefinition => ({ ...testAmulet(id, 2), attack: 3, defense: 3, traits: o.traits ?? [MOUNT] });
const CARDS: CardDefinition[] = [
  vehicle("CAR"), // Storm; "Activate: Maneuver this card."
  vehicle("SLOW-CAR"), // no Storm
  testAmulet("SHED", 1), // no attack or defense: can't be maneuvered (CR 5.32.1.1)
  testSpell("BOX", 0), // select an enemy follower, engage it, Box it until the end of its controller's next turn
  testSpell("PUMP", 0), // select a follower on your field, +1/+1
  testSpell("WARD-IT", 0), // select an enemy follower, give it Ward
  testFollower("PUMPED", 1, 1, 1), // whenever this follower gains attack or defense, give it Storm
  testSpell("OVERFLOW-QUICK", 1), // has Quick while Overflow is active; draw a card
  testSpell("TOLL", 0), // additional cost: discard a card; draw 2
  testAmulet("SLEEPY", 1), // doesn't refresh during your start phase; Activate engage: draw
  testFollower("MOUNT-WATCH", 2, 1, 1), // whenever a Mount card you control leaves the field, draw
  testSpell("DISCARD-2", 0), // discard 2 cards
  testFollower("DISCARD-WATCH", 2, 1, 1), // whenever you discard 1 or more cards, leader +1
  testFollower("ANY-DISCARD", 2, 1, 1), // whenever a player discards a card, leader +1
  testSpell("DECLARE", 0), // declare a card name; the top card has it: draw 2, else draw 1
  testSpell("RANDOM-2", 0), // 2 random cards from your hand into your EX area
];
const maneuverSelf = activated(
  {},
  {
    *resolve(fx) {
      yield* fx.maneuver(fx.self);
    },
  },
);
const SCRIPTS: Record<string, CardScript> = {
  CAR: defineCard({ keywords: ["storm"], abilities: [maneuverSelf, activated({ burySelf: true }, { *resolve() {} })] }),
  "SLOW-CAR": defineCard({ abilities: [maneuverSelf] }),
  SHED: defineCard({ abilities: [maneuverSelf] }),
  BOX: defineCard({
    abilities: [
      spell({
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.engage([target]);
          yield* fx.box(target, "endOfOpponentsNextTurn");
        },
      }),
    ],
  }),
  PUMP: defineCard({ abilities: [spell({ targets: [yourFollower()], *resolve(fx) { yield* fx.giveStats(fx.targets[0]![0]!, 1, 1); } })] }),
  "WARD-IT": defineCard({ abilities: [spell({ targets: [enemyFollower()], *resolve(fx) { yield* fx.giveKeyword(fx.targets[0]![0]!, "ward"); } })] }),
  PUMPED: defineCard({ abilities: [whenThisGainsStats({ *resolve(fx) { yield* fx.giveKeyword(fx.self, "storm"); } })] }),
  "OVERFLOW-QUICK": defineCard({
    selfKeywords: (g, self) => (g.overflow(g.controller(self)) ? ["quick"] : []),
    abilities: [spell({ *resolve(fx) { yield* fx.draw(1); } })],
  }),
  TOLL: defineCard({
    playOptionsRequired: true,
    playOptions: [
      {
        id: "discard",
        label: "Discard a card",
        canPay: (g, c, self) => g.cards(c, "hand").some((id) => id !== self),
        *pay(fx) {
          yield* fx.discard(fx.controller, 1, 1);
        },
      },
    ],
    abilities: [spell({ *resolve(fx) { yield* fx.draw(2); } })],
  }),
  SLEEPY: defineCard({ noStartPhaseRefresh: true, abilities: [activated({ engageSelf: true }, { *resolve(fx) { yield* fx.draw(1); } })] }),
  "MOUNT-WATCH": defineCard({
    abilities: [whenYourCardLeaves({ *resolve(fx) { yield* fx.draw(1); } }, { filter: (m) => m.before?.traits?.includes(MOUNT) === true })],
  }),
  "DISCARD-2": defineCard({ abilities: [spell({ *resolve(fx) { yield* fx.discard(fx.controller, 2, 2); } })] }),
  "DISCARD-WATCH": defineCard({ abilities: [whenYouDiscardAny({ *resolve(fx) { yield* fx.giveLeaderDefense(fx.controller, 1); } })] }),
  "ANY-DISCARD": defineCard({ abilities: [whenAnyPlayerDiscards({ *resolve(fx) { yield* fx.giveLeaderDefense(fx.controller, 1); } })] }),
  DECLARE: defineCard({
    abilities: [
      spell({
        *resolve(fx) {
          const name = yield* fx.declareCardName();
          const [top] = fx.topCards(1);
          if (top === undefined) return;
          yield* fx.reveal([top]);
          yield* fx.draw(name !== null && fx.game.info(top).names.includes(name) ? 2 : 1);
        },
      }),
    ],
  }),
  "RANDOM-2": defineCard({ abilities: [spell({ *resolve(fx) { yield* fx.putIntoEx(fx.randomCards(fx.game.cards(fx.controller, "hand"), 2)); } })] }),
};
const E = createEngine({ cards: [...TEST_CARDS, ...CARDS], scripts: { ...TEST_SCRIPTS, ...SCRIPTS } });
const d = (spec: DriveSpec) => drive(E, spec);
const type = (t: ReturnType<typeof d>, ref: string) => t.game.reader().info(t.id(ref)).type;
const endOpponentTurn = (t: ReturnType<typeof d>) => t.game.act({ type: "mainPhase", action: { type: "endMainPhase" } });

describe("BP11 / BP12 mechanics", () => {
  it("CR 5.32 — a maneuvered amulet is a follower with its printed numbers for the rest of the turn", () => {
    const t = d({ me: { field: ["CAR"], hand: ["PUMP"], deck: ["V1", "V1"], playPoints: 1 }, opp: { deck: ["V1", "V1"] } });
    expect([type(t, "CAR"), t.stats("CAR")]).toEqual(["amulet", [null, null]]);
    t.activate("CAR").play("PUMP");
    expect([type(t, "CAR"), t.stats("CAR"), t.attackTargets("CAR")]).toEqual(["follower", [4, 4], ["opp:leader"]]);
    t.attack("CAR", "opp:leader");
    expect(t.leader("opp")).toBe(16);
    t.end();
    expect([type(t, "CAR"), t.stats("CAR")]).toEqual(["amulet", [null, null]]);
    endOpponentTurn(t);
    // A new maneuver starts from the printed numbers again (rulings).
    t.activate("CAR");
    expect(t.stats("CAR")).toEqual([3, 3]);
  });

  it("CR 5.32 — maneuvered on the turn it entered, it attacks only as its keywords allow; abilities given stay; no numbers, no maneuver", () => {
    const fresh = d({ me: { field: [{ card: "SLOW-CAR", enteredThisTurn: true }] }, opp: { field: ["V1"] } }).activate("SLOW-CAR");
    expect([type(fresh, "SLOW-CAR"), fresh.attackTargets("SLOW-CAR")]).toEqual(["follower", []]);
    const old = d({ me: { field: ["SLOW-CAR"] } }).activate("SLOW-CAR");
    expect(old.attackTargets("SLOW-CAR")).toEqual(["opp:leader"]);
    const shed = d({ me: { field: ["SHED"] } }).activate("SHED");
    expect(type(shed, "SHED")).toBe("amulet");
  });

  it("CR 5.31 — Boxed: loses its abilities, doesn't refresh in its controller's start phase, keeps abilities given later, then recovers", () => {
    const t = d({ me: { hand: ["BOX", "WARD-IT"], deck: ["V1"] }, opp: { field: ["WARD"], deck: ["V1"] } }).play("BOX");
    expect([t.keywords("opp:WARD"), t.engaged("opp:WARD"), t.game.reader().isBoxed(t.id("opp:WARD"))]).toEqual([[], true, true]);
    t.end();
    // The opponent's start phase: it stays engaged (5.31.3).
    expect([t.engaged("opp:WARD"), t.keywords("opp:WARD")]).toEqual([true, []]);
    endOpponentTurn(t);
    expect([t.game.reader().isBoxed(t.id("opp:WARD")), t.keywords("opp:WARD")]).toEqual([false, ["ward"]]);
    // 5.31.2.1 — an ability given after it was Boxed works.
    const later = d({ me: { hand: ["BOX", "WARD-IT"] }, opp: { field: ["V5"] } }).play("BOX").play("WARD-IT");
    expect(later.keywords("opp:V5")).toEqual(["ward"]);
  });

  it("gaining attack or defense: an effect's +X or a super-evolution's +1/+1 (CR 12.2.4.1) is recorded and triggers", () => {
    const t = d({ me: { field: ["PUMPED"], hand: ["PUMP"] } });
    expect(t.game.reader().gainedStatsThisTurn(t.id("PUMPED"))).toBe(false);
    t.play("PUMP");
    expect([t.stats("PUMPED"), t.keywords("PUMPED"), t.game.reader().gainedStatsThisTurn(t.id("PUMPED"))]).toEqual([[2, 2], ["storm"], true]);
    const sup = d({ me: { field: ["EVOLVER"], evolveDeck: ["EVOLVER-E"], playPoints: 2, superEvolutionPoints: 1, turnsPassed: 8 } }).evolve("EVOLVER", { sep: true });
    expect([sup.stats("EVOLVER"), sup.game.reader().gainedStatsThisTurn(sup.id("EVOLVER"))]).toEqual([[5, 5], true]);
    expect(d({ me: { field: ["EVOLVER"], evolveDeck: ["EVOLVER-E"], playPoints: 2 } }).evolve("EVOLVER").game.reader().gainedStatsThisTurn(sup.id("EVOLVER"))).toBe(false);
  });

  it("a card's own conditional keyword works in the hand (BP12-058: Quick while Overflow is active)", () => {
    expect(d({ me: { hand: ["OVERFLOW-QUICK"], maxPlayPoints: 7 } }).keywords("OVERFLOW-QUICK@hand")).toEqual(["quick"]);
    expect(d({ me: { hand: ["OVERFLOW-QUICK"], maxPlayPoints: 6 } }).keywords("OVERFLOW-QUICK@hand")).toEqual([]);
  });

  it("\"As an additional cost to play this card\": not playable without paying it", () => {
    expect(d({ me: { hand: ["TOLL"] } }).canPlay("TOLL")).toBe(false);
    const t = d({ me: { hand: ["TOLL", "V1"], deck: ["V5", "V5"] } }).play("TOLL");
    expect([t.hand(), t.cemetery()]).toEqual([["V5", "V5"], ["V1", "TOLL"]]);
  });

  it("\"This card doesn't refresh during your start phase\"", () => {
    const t = d({ me: { field: ["SLEEPY"], deck: ["V1", "V1"] }, opp: { deck: ["V1"] } }).activate("SLEEPY").end();
    endOpponentTurn(t);
    expect(t.engaged("SLEEPY")).toBe(true);
  });

  it("leave-field triggers see the card's traits on the field (\"a Mount card you control\")", () => {
    const t = d({ me: { field: ["MOUNT-WATCH", "CAR"], deck: ["V1"] } }).activate("CAR", 1);
    expect(t.hand()).toEqual(["V1"]);
    const shed = d({ me: { field: ["MOUNT-WATCH", "SHED"], deck: ["V1"] } });
    shed.game.act({ type: "mainPhase", action: { type: "endMainPhase" } });
    expect(shed.hand()).toEqual([]);
  });

  it("\"whenever you discard 1 or more cards\" triggers once for cards discarded together; \"whenever a player discards a card\" once per card", () => {
    const t = d({ me: { field: ["DISCARD-WATCH", "ANY-DISCARD"], hand: ["DISCARD-2", "V1", "V5"] } }).play("DISCARD-2").flush();
    expect(t.leader()).toBe(20 + 1 + 2);
  });

  it("CR 5.33 — declare a card name: any name in the pool, or another one", () => {
    const hit = d({ me: { hand: ["DECLARE"], deck: ["V1", "V5", "V5"] } }).play("DECLARE").choose("V1");
    expect(hit.hand()).toEqual(["V1", "V5"]);
    const miss = d({ me: { hand: ["DECLARE"], deck: ["V1", "V5", "V5"] } }).play("DECLARE").choose("(other name)");
    expect(miss.hand()).toEqual(["V1"]);
  });

  it("random cards come from the game's random numbers: the same seed picks the same cards", () => {
    const run = () => d({ seed: 7, me: { hand: ["RANDOM-2", "V1", "V5", "WARD", "PUMP"] } }).play("RANDOM-2").ex();
    const picked = run();
    expect(picked).toHaveLength(2);
    expect(run()).toEqual(picked);
  });
});
