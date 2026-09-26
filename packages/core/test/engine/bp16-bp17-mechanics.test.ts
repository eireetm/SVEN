import { describe, expect, it } from "vitest";
import { createEngine, script, type CardDefinition, type CardScript } from "../../src";
import { named, yourCardOnField, yourFollower } from "../../src/script/targets";
import { drive, testAmulet, testFollower, testSpell, type DriveSpec } from "../../src/testing";
import { TEST_CARDS, TEST_SCRIPTS } from "../helpers";

// Engine behaviour added for BP16 / BP17, with synthetic cards. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5;
// QUICK-SAC (0) destroys one of your followers; EVOLVER (2/2) has Evolve (2) into EVOLVER-E (4/4).
const { defineCard, spell, whenYourLeaderLosesDefense, whenThisDealsDamageToEnemyLeader } = script;
const CARDS: CardDefinition[] = [
  { ...testAmulet("PRAYER", 1), attack: 3, defense: 3 }, // a follower while it has 4 prayer counters
  testSpell("SILENCE", 0), // a card on your field loses all abilities
  testSpell("REPEAT", 0), // for the rest of this turn, whenever your leader loses defense, draw a card
  testSpell("OUCH", 0), // 1 damage to your leader
  testSpell("PLUS1", 0), // a follower of yours deals that much plus 1 damage this turn
  testSpell("PICKY", 3), // costs 2 less if you selected V1; give it +1/+1
  testSpell("SEARCH6", 0), // up to 2 cards costing a total of 6 or less from the deck
  testFollower("TAUNTER", 1, 1, 1), // whenever this deals damage to an enemy leader, draw a card
];
const SCRIPTS: Record<string, CardScript> = {
  PRAYER: defineCard({ typeWhile: (g, self) => (g.counters(self, "prayer") >= 4 ? "follower" : undefined) }),
  SILENCE: defineCard({
    abilities: [
      spell({
        targets: [yourCardOnField()],
        *resolve(fx) {
          yield* fx.loseAbilities(fx.targets[0]![0]!, "endOfTurn");
        },
      }),
    ],
  }),
  REPEAT: defineCard({
    abilities: [
      spell({
        *resolve(fx) {
          yield* fx.delay(1, "endOfTurn", undefined, { repeat: true });
        },
      }),
      {
        ...whenYourLeaderLosesDefense({
          *resolve(fx) {
            yield* fx.draw(1);
          },
        }),
        delayed: true,
      },
    ],
  }),
  OUCH: defineCard({
    abilities: [
      spell({
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.controller), 1);
        },
      }),
    ],
  }),
  PLUS1: defineCard({
    abilities: [
      spell({
        targets: [yourFollower()],
        *resolve(fx) {
          yield* fx.dealsMoreDamage(fx.targets[0]![0]!, 1, "endOfTurn");
        },
      }),
    ],
  }),
  PICKY: defineCard({
    playOptionsRequired: true,
    playOptions: [
      { id: "v1", label: "Select V1: costs 2 less", canPay: () => true, *pay() {}, costDelta: -2, targetFilter: named("V1") },
      { id: "other", label: "Select another follower", canPay: () => true, *pay() {}, targetFilter: (g, id) => !named("V1")(g, id) },
    ],
    abilities: [
      spell({
        targets: [yourFollower()],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
        },
      }),
    ],
  }),
  SEARCH6: defineCard({
    abilities: [
      spell({
        *resolve(fx) {
          yield* fx.search(() => true, { max: 2, totalCostAtMost: 6 });
        },
      }),
    ],
  }),
  TAUNTER: defineCard({
    abilities: [
      whenThisDealsDamageToEnemyLeader(
        {
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
        { onlyYourTurn: true },
      ),
    ],
  }),
};
const E = createEngine({ cards: [...TEST_CARDS, ...CARDS], scripts: { ...TEST_SCRIPTS, ...SCRIPTS } });
const d = (spec: DriveSpec) => drive(E, spec);

describe("BP16 / BP17 mechanics", () => {
  it("CR 5.25 — a card that is a follower while it has 4 prayer counters, an amulet again without its abilities (BP16-093)", () => {
    const type = (t: ReturnType<typeof d>) => t.game.reader().info(t.id("PRAYER")).type;
    const three = d({ me: { field: [{ card: "PRAYER", counters: { prayer: 3 } }] }, opp: { deck: ["V1"] } });
    expect([type(three), three.stats("PRAYER"), three.attackTargets("PRAYER")]).toEqual(["amulet", [null, null], []]);
    const four = d({ me: { field: [{ card: "PRAYER", counters: { prayer: 4 } }], hand: ["SILENCE"] } });
    // It has been on the field since the start of the turn, so it can attack (BP16-093 ruling).
    expect([type(four), four.stats("PRAYER"), four.attackTargets("PRAYER")]).toEqual(["follower", [3, 3], ["opp:leader"]]);
    four.play("SILENCE");
    expect(type(four)).toBe("amulet");
  });

  it("CR 10.7.5.1 — \"for the rest of this turn, whenever ...\" triggers every time, and ends with the turn", () => {
    const t = d({ me: { hand: ["REPEAT", "OUCH", "OUCH"], deck: ["V1", "V3", "V5"] }, opp: { deck: ["V1"] } });
    t.play("REPEAT").play("OUCH").play("OUCH");
    expect(t.hand()).toEqual(["V1", "V3"]);
    t.end();
    expect(t.game.state.delayed).toEqual([]);
  });

  it("CR 5.14.2 — a follower that deals that much plus 1 damage this turn (two of them are +2, BP17-T06 ruling)", () => {
    const spec: DriveSpec = { me: { field: ["V3"], hand: ["PLUS1", "PLUS1"] }, opp: { field: [{ card: "V5", engaged: true }] } };
    expect(d(spec).play("PLUS1").attack("V3", "opp:V5").stats("opp:V5")).toEqual([5, 1]);
    expect(d(spec).play("PLUS1").play("PLUS1").attack("V3", "opp:V5").field("opp")).toEqual([]);
  });

  it("CR 10.6.2.3 / 10.6.2.5 — a cost that depends on the selected target: options with disjoint target filters (BP17-030)", () => {
    // With 1 play point only the V1 option is affordable, and it only offers V1.
    const t = d({ me: { hand: ["PICKY"], field: ["V1", "V3"], playPoints: 1 } }).play("PICKY");
    expect([t.stats("V1"), t.stats("V3"), t.pp()]).toEqual([[3, 3], [3, 4], 0]);
    const rich = d({ me: { hand: ["PICKY"], field: ["V1", "V3"], playPoints: 3 } }).play("PICKY").choose("other");
    expect([rich.stats("V3"), rich.pp()]).toEqual([[4, 5], 0]);
    expect(d({ me: { hand: ["PICKY"], field: ["V3"], playPoints: 1 } }).canPlay("PICKY")).toBe(false);
  });

  it("CR 5.8 — up to 2 cards costing a total of 6 or less: found one at a time within what is left", () => {
    const t = d({ me: { hand: ["SEARCH6"], deck: ["V5", "V3", "V1", "V3"] } }).play("SEARCH6").pick("V5");
    expect(t.decision?.type === "selectCards" ? t.decision.candidateDefs : []).toEqual(["V1"]);
    expect(t.pick("V1").hand()).toEqual(["V5", "V1"]);
  });

  it("this turn: a follower on your field evolved, and the cards that left your field", () => {
    const t = d({ me: { field: ["EVOLVER", "V1"], evolveDeck: ["EVOLVER-E"], hand: ["QUICK-SAC"], playPoints: 2 } });
    const reader = () => t.game.reader();
    expect([reader().followerEvolvedThisTurn(0), reader().cardsLeftFieldThisTurn(0)]).toEqual([false, []]);
    t.evolve("EVOLVER").play("QUICK-SAC").pick("V1");
    expect([reader().followerEvolvedThisTurn(0), reader().cardsLeftFieldThisTurn(0).map((c) => c.names)]).toEqual([true, [["V1"]]]);
  });

  it("whenever this deals damage to an enemy leader (during your turn)", () => {
    expect(d({ me: { field: ["TAUNTER"], deck: ["V1"] } }).attack("TAUNTER", "opp:leader").hand()).toEqual(["V1"]);
  });
});
