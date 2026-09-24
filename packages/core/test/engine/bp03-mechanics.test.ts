import { describe, expect, it } from "vitest";
import { createEngine, type CardScript } from "../../src";
import { drive, testEvolved, testFollower, testSpell, type DriveSpec } from "../../src/testing";
import { TEST_CARDS, TEST_SCRIPTS } from "../helpers";
import { defineCard, evolveAbility, fanfare, spell, whenThisIsSelected } from "../../src/script/helpers";
import { enemyFollower } from "../../src/script/targets";

const extra = [
  testFollower("DRAINER", 1, 3, 3, { text: "Drain" }),
  testFollower("ALSO", 1, 2, 2, { name: "Also Body", text: "This follower's name is also Ghost." }),
  testEvolved("ALSO-E", "Also Body", 3, 3),
  testFollower("NAMED", 2, 1, 1, { name: "Ghost", text: "Rush" }),
  testFollower("FORCE", 2, 2, 5, { text: "Opponents must select this." }),
  testSpell("SPLIT", 0, { text: "Deal 4 divided between up to 2." }),
  testSpell("CHEAP", 6, { text: "Deal 1." }),
  testFollower("OZ", 1, 1, 1, { text: "Next spell costs 4 less." }),
  testFollower("LIZARD", 1, 2, 4, { text: "When selected, +1 and ping." }),
  testSpell("PING", 0, { text: "Deal 1 to an enemy follower." }),
  testFollower("THIEF", 1, 1, 1, { text: "Steal." }),
  testFollower("BASE", 1, 2, 2, { name: "Evo Host", text: "Evolve into a name." }),
  testEvolved("FORM", "Evo Host, Attack Form", 7, 5, { text: "Also Evo Host." }),
  testFollower("GRANT", 1, 1, 1, { text: "Grant destroy." }),
  testFollower("NOATK", 2, 3, 3, { text: "Can't attack without a counter." }),
];

const s = (x: CardScript) => defineCard(x);

const scripts: Record<string, CardScript> = {
  ...TEST_SCRIPTS,
  DRAINER: s({ keywords: ["drain"] }),
  ALSO: s({ alsoNames: ["Ghost"], abilities: [evolveAbility(0)] }),
  FORCE: s({ mustBeSelected: true }),
  SPLIT: s({
    abilities: [
      spell({
        targets: [enemyFollower({ count: 2, upTo: true })],
        *resolve(fx) {
          yield* fx.dealDividedDamage(fx.targets[0] ?? [], 4);
        },
      }),
    ],
  }),
  CHEAP: s({
    abilities: [
      spell({
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
        },
      }),
    ],
  }),
  OZ: s({
    abilities: [
      fanfare({
        *resolve(fx) {
          yield* fx.nextSpellCostsLess(4);
        },
      }),
    ],
  }),
  LIZARD: s({
    abilities: [
      whenThisIsSelected({
        oncePerTurn: true,
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 0);
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
        },
      }),
    ],
  }),
  PING: s({
    keywords: ["quick"],
    abilities: [
      spell({
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      }),
    ],
  }),
  THIEF: s({
    abilities: [
      fanfare({
        targets: [enemyFollower()],
        *resolve(fx) {
          const id = fx.targets[0]?.[0];
          if (id === undefined) return;
          const neu = yield* fx.steal(id);
          if (neu) yield* fx.refresh([neu]);
        },
      }),
    ],
  }),
  BASE: s({ abilities: [evolveAbility(0, { nameIncludes: "Evo Host" })] }),
  FORM: s({ alsoNames: ["Evo Host"] }),
  GRANT: s({
    abilities: [
      fanfare({
        *resolve(fx) {
          const id = fx.game.followers(fx.controller).find((c) => c !== fx.self);
          if (id) yield* fx.grant(id, "destroyAtEnd");
        },
      }),
    ],
  }),
  NOATK: s({ cannotAttack: (g, self) => g.counters(self, "fable") === 0 }),
};

const engine = createEngine({ cards: [...TEST_CARDS, ...extra], scripts });
const d = (spec: DriveSpec) => drive(engine, spec);

describe("BP03 mechanics", () => {
  it("Drain heals the leader for attack damage only (CR 12.13)", () => {
    const t = d({
      me: { field: ["DRAINER"], leaderDefense: 10 },
      opp: { field: [{ card: "V2", engaged: true }] },
    });
    t.attack("DRAINER", "opp:V2");
    // Attack damage 3 heals; the defender's combat damage does not.
    expect(t.leader()).toBe(10 + 3);
    expect(t.stats("DRAINER")).toEqual([3, 1]);
  });

  it("steal keeps damage and does not grant a new fanfare (CR 5.22)", () => {
    const t = d({
      me: { hand: ["THIEF"], playPoints: 1 },
      opp: { field: [{ card: "V5", damage: 2, engaged: true }] },
    });
    t.play("THIEF");
    expect(t.field("me")).toEqual(["THIEF", "V5"]);
    expect(t.field("opp")).toEqual([]);
    expect(t.stats("V5")).toEqual([5, 3]);
    expect(t.engaged("V5")).toBe(false);
  });

  it("an extra name applies on the field and a name-includes evolve can pick that form", () => {
    const t = d({
      me: { field: ["BASE"], evolveDeck: ["FORM"], playPoints: 1 },
    });
    expect(t.canEvolve("BASE")).toBe(true);
    t.evolve("BASE");
    expect(t.stats("BASE")).toEqual([7, 5]);
    expect(t.game.reader().info(t.game.state.players[0].zones.field[0]!).names).toEqual(["Evo Host, Attack Form", "Evo Host"]);
  });

  it("must-select forces the opponent's choice to include the card (CR 1.3.2.3)", () => {
    const t = d({
      me: { hand: ["PING"], playPoints: 1 },
      opp: { field: ["FORCE", "V1"] },
    });
    t.play("PING");
    expect(t.game.decision).toMatchObject({ type: "selectCards", min: 1, max: 1 });
    const decision = t.game.decision;
    if (decision?.type !== "selectCards") throw new Error("expected a selection");
    expect(decision.mandatory?.map((id) => t.game.state.cards[id]!.def)).toEqual(["FORCE"]);
    t.pick("opp:FORCE");
    expect(t.stats("opp:FORCE")).toEqual([2, 4]);
  });

  it("the next spell this turn costs less, then the reduction is gone", () => {
    const t = d({ me: { hand: ["OZ", "CHEAP", "CHEAP"], playPoints: 10 } });
    t.play("OZ");
    expect(t.pp()).toBe(9);
    t.play("CHEAP");
    expect(t.pp()).toBe(9 - 2);
    t.play("CHEAP");
    expect(t.pp()).toBe(1);
  });

  it("divided damage lets the player assign the split", () => {
    const t = d({ me: { hand: ["SPLIT"] }, opp: { field: ["V5", "V3"] } });
    t.play("SPLIT").pick("opp:V5", "opp:V3").choose("1");
    expect(t.stats("opp:V5")).toEqual([5, 4]);
    expect(t.stats("opp:V3")).toEqual([3, 1]);
  });

  it("being selected on your turn pings the enemy leader and gives +1 if it is still on the field", () => {
    // Opponent's Quick spell during our turn (CR 12.3.4). The follower's controller is us.
    const t = d({
      me: { field: ["LIZARD"] },
      opp: { hand: ["PING"], playPoints: 1, deck: ["V1"] },
    });
    t.end().quick("opp:PING");
    expect(t.stats("LIZARD")).toEqual([3, 3]);
    expect(t.leader("opp")).toBe(19);
  });

  it("a granted end-phase destroy resolves at the start of the end phase", () => {
    const t = d({
      me: { hand: ["GRANT"], field: ["V1"], playPoints: 1 },
      opp: { deck: ["V1"] },
    });
    t.play("GRANT").end();
    expect(t.field("me")).toEqual(["GRANT"]);
    expect(t.cemetery("me")).toContain("V1");
  });

  it("a conditional can't-attack blocks attacks until a counter is added", () => {
    const asleep = d({ me: { field: ["NOATK"] }, opp: { field: [{ card: "V1", engaged: true }] } });
    expect(asleep.attackTargets("NOATK")).toEqual([]);
    const awake = d({
      me: { field: [{ card: "NOATK", counters: { fable: 1 } }] },
      opp: { field: [{ card: "V1", engaged: true }] },
    });
    expect(awake.attackTargets("NOATK")).toContain("V1");
  });
});
