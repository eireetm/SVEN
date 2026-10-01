import { describe, expect, it } from "vitest";
import { createEngine, script, type CardDefinition, type CardScript } from "../../src";
import { earthRiteCost } from "../../src/script/costs";
import { enemyFollower, yourFollower } from "../../src/script/targets";
import { drive, testFollower, testSpell, type DriveSpec } from "../../src/testing";
import { BP01_CARDS, BP01_SCRIPTS } from "../../src/sets/bp01";
import { TEST_CARDS, TEST_SCRIPTS } from "../helpers";

// Engine behaviour added for BP22 (the pre-release set, data/preview.ts), with synthetic cards. V1 is 1c 2/2, V3 3c 3/4, V5 5c
// 5/5; KILL (1) destroys an enemy follower; BP01-T10 is Magic Sediment (Stack).
const { activated, defineCard, spell, whenCardPutIntoYourBanishedZone, whenEnemyFollowerToCemetery, whenYourCardsLeaveEx } = script;
const CARDS: CardDefinition[] = [
  testFollower("EX-WATCH", 1, 1, 1), // when cards of yours leave the EX area: draw that many
  testFollower("VOID-WATCH", 1, 1, 1), // during your turn, a card put into your banished zone: 1 damage to the enemy leader
  testFollower("AVENGER", 1, 1, 1), // during your turn, an enemy follower to the cemetery: damage equal to its attack to its leader
  testFollower("EX-DISCOUNT", 1, 1, 1), // act (0): for the rest of this turn, cards you play from your EX area cost 1 less
  testFollower("RITE-GIANT", 6, 6, 6), // when playing this, Earth Rite (3): this costs 0
  testFollower("SHELL", 1, 1, 3), // while engaged, can't be destroyed by abilities
  testSpell("EX-PURGE", 0), // banish every card in your EX area
  testSpell("SELF-BANISH", 0), // banish a follower of yours
  testSpell("PUMP-ENEMY", 0), // give an enemy follower +3/+0
];
const SCRIPTS: Record<string, CardScript> = {
  "EX-WATCH": defineCard({
    abilities: [
      whenYourCardsLeaveEx({
        *resolve(fx) {
          yield* fx.draw(fx.data?.count ?? 0);
        },
      }),
    ],
  }),
  "VOID-WATCH": defineCard({
    abilities: [
      whenCardPutIntoYourBanishedZone(
        {
          *resolve(fx) {
            yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
          },
        },
        { onlyYourTurn: true },
      ),
    ],
  }),
  AVENGER: defineCard({
    abilities: [
      whenEnemyFollowerToCemetery(
        {
          *resolve(fx) {
            yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), fx.data?.count ?? 0);
          },
        },
        { onlyYourTurn: true },
      ),
    ],
  }),
  "EX-DISCOUNT": defineCard({
    nextPlay: { fromEx: (g, card) => g.playZone(card) === "ex" },
    abilities: [
      activated(
        { playPoints: 0 },
        {
          *resolve(fx) {
            yield* fx.cardsCostLessThisTurn("fromEx", 1);
          },
        },
      ),
    ],
  }),
  "RITE-GIANT": defineCard({
    playOptions: [{ id: "rite", label: "Earth Rite (3): this costs 0", canPay: earthRiteCost(3).canPay, pay: earthRiteCost(3).pay, setCost: 0 }],
  }),
  SHELL: defineCard({ cannotBeDestroyedByAbilities: (g, self) => g.card(self)?.engaged === true }),
  "EX-PURGE": defineCard({
    abilities: [
      spell({
        *resolve(fx) {
          yield* fx.banish(fx.game.cards(fx.controller, "ex"));
        },
      }),
    ],
  }),
  "SELF-BANISH": defineCard({
    abilities: [
      spell({
        targets: [yourFollower()],
        *resolve(fx) {
          yield* fx.banish(fx.targets[0]!);
        },
      }),
    ],
  }),
  "PUMP-ENEMY": defineCard({
    abilities: [
      spell({
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 3, 0);
        },
      }),
    ],
  }),
};
// Magic Sediment (BP01-T10), the Stack amulet Earth Rite is paid from (CR 13.3).
const SEDIMENT = BP01_CARDS.find((c) => c.id === "BP01-T10")!;
const E = createEngine({ cards: [...TEST_CARDS, ...CARDS, SEDIMENT], scripts: { ...TEST_SCRIPTS, ...SCRIPTS, "BP01-T10": BP01_SCRIPTS["BP01-T10"]! } });
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP22 engine additions", () => {
  it("whenYourCardsLeaveEx: once for the cards leaving your EX area together, with how many (BP22-017)", () => {
    const t = d({ me: { field: ["EX-WATCH"], ex: ["V1", "V1", "V3"], hand: ["EX-PURGE"], deck: ["V5", "V5", "V5", "V5"], playPoints: 1 } }).play("V1@ex");
    expect(t.hand()).toEqual(["EX-PURGE", "V5"]);
    t.play("EX-PURGE");
    expect([t.ex(), t.hand()]).toEqual([[], ["V5", "V5", "V5"]]);
  });

  it("whenCardPutIntoYourBanishedZone: once per card, during your turn, this card itself banished from the field too (BP22-037)", () => {
    const t = d({ me: { field: ["VOID-WATCH", "V1"], ex: ["V3", "V5"], hand: ["EX-PURGE", "SELF-BANISH"] } }).play("EX-PURGE").flush();
    expect(t.leader("opp")).toBe(18);
    t.play("SELF-BANISH").pick("VOID-WATCH");
    expect(t.leader("opp")).toBe(17);
  });

  it("look-back attack: an enemy follower put into the cemetery is seen with its attack on the field, changes included (CR 10.7.4.1.2)", () => {
    const t = d({ me: { field: ["AVENGER"], hand: ["PUMP-ENEMY", "KILL"], playPoints: 1 }, opp: { field: ["V3", "V1"] } });
    t.play("PUMP-ENEMY").pick("opp:V3").play("KILL").pick("opp:V3");
    expect(t.leader("opp")).toBe(14);
  });

  it("cardsCostLessThisTurn: every matching card played this turn costs less, twice is twice as much (BP22-049)", () => {
    const t = d({ me: { field: ["EX-DISCOUNT"], ex: ["V3", "V3"], hand: ["V3"], playPoints: 3 } }).activate("EX-DISCOUNT").activate("EX-DISCOUNT");
    t.play("V3@ex");
    expect(t.pp()).toBe(2);
    t.play("V3@ex");
    expect([t.pp(), t.canPlay("V3@hand")]).toEqual([1, false]);
  });

  it("earthRiteCost: a play option paid with Earth Rite (N) from one Stack amulet (BP22-039)", () => {
    const t = d({ me: { hand: ["RITE-GIANT"], field: [{ card: "BP01-T10", counters: { stack: 3 } }], playPoints: 0 } }).play("RITE-GIANT");
    expect([t.field(), t.pp()]).toEqual([["RITE-GIANT"], 0]);
    expect(d({ me: { hand: ["RITE-GIANT"], field: [{ card: "BP01-T10", counters: { stack: 2 } }], playPoints: 0 } }).canPlay("RITE-GIANT")).toBe(false);
  });

  it("cannotBeDestroyedByAbilities with a condition (BP22-061 while engaged)", () => {
    const opp = d({ me: { hand: ["KILL"], playPoints: 1 }, opp: { field: [{ card: "SHELL", engaged: true }, "V1"] } }).play("KILL").pick("opp:SHELL");
    expect(opp.field("opp")).toEqual(["SHELL", "V1"]);
    const up = d({ me: { hand: ["KILL"], playPoints: 1 }, opp: { field: ["SHELL", "V1"] } }).play("KILL").pick("opp:SHELL");
    expect(up.field("opp")).toEqual(["V1"]);
  });
});
