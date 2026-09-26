import { describe, expect, it } from "vitest";
import { createEngine, script, type CardDefinition, type CardScript } from "../../src";
import { fuse, fusedCards } from "../../src/script/costs";
import { and, costAtMost, inYourZone, isFollower, isToken, named } from "../../src/script/targets";
import { drive, testAmulet, testFollower, testSpell, type DriveSpec } from "../../src/testing";
import { TEST_CARDS, TEST_SCRIPTS } from "../helpers";

// Engine behaviour added for BP18 / BP19, with synthetic cards. V1 is 1c 2/2, V3 3c 3/4, V5 5c 5/5; KILL (1)
// destroys an enemy follower; QUICK-SAC (0) destroys one of your followers; LW-DRAW has "Last Words: draw a card";
// EVOLVER (2/2) has Evolve (2) into EVOLVER-E (4/4); AMULET (1) is an amulet.
const { activated, atStartOfYourEndPhase, defineCard, lastWords, spell, whenThisIsFused, whenYourFollowerEvolves } = script;
const CARDS: CardDefinition[] = [
  testFollower("UNLIMITED", 1, 1, 1), // you may play any number of Evolve per turn
  testFollower("ADVANCER", 1, 1, 1), // {[adv]} (0): draw a card
  testFollower("COUNTER", 1, 1, 1), // whenever a follower on your field evolves: damage to the enemy leader = which evolution
  testFollower("GRAVE", 1, 2, 2), // may be played from the cemetery if you've played a card this turn
  testSpell("OPEN-VAULT", 0), // for the rest of this turn, you may play cards from your banished zone
  testFollower("VOIDER", 1, 1, 1), // an enemy follower going from the field to the cemetery is banished instead
  testFollower("STUBBORN", 1, 1, 3), // can't be banished by abilities; Last Words: draw a card
  testFollower("ECHO", 1, 1, 1), // your end-phase abilities trigger 1 more time
  testFollower("ENDDRAW", 1, 1, 1), // at the start of your end phase, draw a card
  testFollower("FUSER", 2, 2, 2), // activate in hand, fuse a non-token follower: a fusion counter on this; draw if a V1
  testFollower("FUSEE", 1, 1, 1), // when this is fused by your follower's ability, draw a card
  testSpell("TWO-GRAVES", 0), // up to 1 follower (5 or less) and up to 1 other follower (3 or less) from your cemetery
  testSpell("NAMES", 0), // up to 3 followers with different names from your cemetery into your hand
  testAmulet("AMULET2", 1),
];
const SCRIPTS: Record<string, CardScript> = {
  UNLIMITED: defineCard({ field: { unlimitedEvolve: true } }),
  ADVANCER: defineCard({
    abilities: [
      activated(
        { playPoints: 0 },
        {
          advanced: true,
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
      ),
    ],
  }),
  COUNTER: defineCard({
    abilities: [
      whenYourFollowerEvolves({
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), fx.data?.count ?? 0);
        },
      }),
    ],
  }),
  GRAVE: defineCard({ playableFromCemetery: (g, _self, p) => g.playedThisTurn(p) >= 1 }),
  "OPEN-VAULT": defineCard({
    abilities: [
      spell({
        *resolve(fx) {
          yield* fx.allowPlayFromBanishedThisTurn();
        },
      }),
    ],
  }),
  VOIDER: defineCard({ field: { banishesEnemyFollowersInsteadOfCemetery: true } }),
  STUBBORN: defineCard({
    cannotBeBanishedByAbilities: true,
    abilities: [
      lastWords({
        *resolve(fx) {
          yield* fx.draw(1);
        },
      }),
    ],
  }),
  ECHO: defineCard({ field: { extraEndPhaseTriggers: 1 } }),
  ENDDRAW: defineCard({
    abilities: [
      atStartOfYourEndPhase({
        *resolve(fx) {
          yield* fx.draw(1);
        },
      }),
    ],
  }),
  FUSER: defineCard({
    abilities: [
      activated(
        { custom: fuse((g, id) => isFollower(g, id) && !isToken(g, id)) },
        {
          validIn: ["hand"],
          *resolve(fx) {
            const self = fx.memory.fusion;
            if (typeof self === "string") yield* fx.addCounters(self, "fusion", 1);
            if (fusedCards(fx.memory).some((id) => named("V1")(fx.game, id))) yield* fx.draw(1);
          },
        },
      ),
    ],
  }),
  FUSEE: defineCard({
    abilities: [
      whenThisIsFused(
        {
          *resolve(fx) {
            yield* fx.draw(1);
          },
        },
        isFollower,
      ),
    ],
  }),
  "TWO-GRAVES": defineCard({
    abilities: [
      spell({
        targets: [
          inYourZone("cemetery", { upTo: true, filter: and(isFollower, costAtMost(5)) }),
          inYourZone("cemetery", { upTo: true, distinct: true, filter: and(isFollower, costAtMost(3)) }),
        ],
        *resolve(fx) {
          yield* fx.returnToHand(fx.targets.flat());
        },
      }),
    ],
  }),
  NAMES: defineCard({
    abilities: [
      spell({
        targets: [inYourZone("cemetery", { count: 3, upTo: true, distinctNames: true, filter: isFollower })],
        *resolve(fx) {
          yield* fx.returnToHand(fx.targets[0]!);
        },
      }),
    ],
  }),
};
const E = createEngine({ cards: [...TEST_CARDS, ...CARDS], scripts: { ...TEST_SCRIPTS, ...SCRIPTS } });
const d = (spec: DriveSpec) => drive(E, spec);
const n = (count: number, id: string) => Array<string>(count).fill(id);

describe("BP18 / BP19 mechanics", () => {
  it("CR 8.3.2.2 — evolve abilities any number of times per turn with the passive (BP18-001); an advanced ability still not after an evolve", () => {
    const two = { field: ["UNLIMITED", "EVOLVER", "EVOLVER"], evolveDeck: ["EVOLVER-E", "EVOLVER-E"], playPoints: 4 };
    expect(d({ me: two }).evolve("EVOLVER").canEvolve("EVOLVER")).toBe(true);
    expect(d({ me: { ...two, field: ["V1", "EVOLVER", "EVOLVER"] } }).evolve("EVOLVER").canEvolve("EVOLVER")).toBe(false);
    const adv = { field: ["UNLIMITED", "ADVANCER", "EVOLVER"], evolveDeck: ["EVOLVER-E"], deck: ["V1"], playPoints: 2 };
    expect(d({ me: adv }).activate("ADVANCER").canEvolve("EVOLVER")).toBe(true);
    expect(d({ me: { ...adv, field: ["V1", "ADVANCER", "EVOLVER"] } }).activate("ADVANCER").canEvolve("EVOLVER")).toBe(false);
    expect(d({ me: adv }).evolve("EVOLVER").canActivate("ADVANCER")).toBe(false);
  });

  it("which evolution of the turn a \"whenever a follower on your field evolves\" trigger saw (BP18-003)", () => {
    const t = d({ me: { field: ["UNLIMITED", "COUNTER", "EVOLVER", "EVOLVER"], evolveDeck: ["EVOLVER-E", "EVOLVER-E"], playPoints: 4 } });
    expect(t.evolve("EVOLVER").leader("opp")).toBe(19);
    expect(t.evolve("EVOLVER").leader("opp")).toBe(17);
  });

  it("CR 1.3.1 / 8.2.1 — a card that may be played from the cemetery (BP18-007); it enters the field from the cemetery", () => {
    const t = d({ me: { cemetery: ["GRAVE"], hand: ["V1"], playPoints: 2 } });
    expect(t.canPlay("GRAVE@cemetery")).toBe(false);
    t.play("V1");
    expect(t.canPlay("GRAVE@cemetery")).toBe(true);
    t.play("GRAVE@cemetery");
    expect([t.field(), t.pp(), t.game.reader().enteredFrom(t.id("GRAVE"))]).toEqual([["V1", "GRAVE"], 0, "cemetery"]);
  });

  it("CR 1.3.1 / 8.2.1 — for the rest of this turn, cards may be played from the banished zone (BP18-T03)", () => {
    const t = d({ me: { hand: ["OPEN-VAULT"], banished: ["V1"], playPoints: 1 }, opp: { deck: ["V1"] } });
    expect(t.canPlay("V1@banished")).toBe(false);
    t.play("OPEN-VAULT");
    expect(t.canPlay("V1@banished")).toBe(true);
    expect(t.play("V1@banished").field()).toEqual(["V1"]);
    const later = d({ me: { hand: ["OPEN-VAULT"], banished: ["V1"] }, opp: { deck: ["V1"] } }).play("OPEN-VAULT").end();
    expect(later.game.reader().canPlayFromBanished(0)).toBe(false);
  });

  it("CR 10.10.1 — an enemy follower going from the field to the cemetery is banished instead: no Last Words; not one that can't be banished (BP18-061)", () => {
    const t = d({ me: { field: ["VOIDER"], hand: ["KILL", "QUICK-SAC"] }, opp: { field: ["LW-DRAW"], deck: ["V1"] } }).play("KILL");
    expect([t.zone("opp", "banished"), t.cemetery("opp"), t.hand("opp")]).toEqual([["LW-DRAW"], [], []]);
    expect(t.play("QUICK-SAC").cemetery()).toEqual(["KILL", "VOIDER", "QUICK-SAC"]);
    const stubborn = d({ me: { field: ["VOIDER"], hand: ["KILL"] }, opp: { field: ["STUBBORN"], deck: ["V1"] } }).play("KILL");
    expect([stubborn.cemetery("opp"), stubborn.hand("opp")]).toEqual([["STUBBORN"], ["V1"]]);
  });

  it("your abilities that trigger at the start of the end phase trigger once more for each such card (BP19-092)", () => {
    expect(d({ me: { field: ["ECHO", "ENDDRAW"], deck: ["V1", "V3", "V5"] }, opp: { deck: ["V1"] } }).end().flush().hand()).toEqual(["V1", "V3"]);
    const two = d({ me: { field: ["ECHO", "ECHO", "ENDDRAW"], deck: ["V1", "V3", "V5", "V1"] }, opp: { deck: ["V1"] } }).end().flush();
    expect(two.hand()).toEqual(["V1", "V3", "V5"]);
  });

  it("CR 12.18 — Fuse: discard from the hand or bury from the EX area, this card into the EX area; the fused card's trigger (BP19-038, 048)", () => {
    const t = d({ me: { hand: ["FUSER", "V1"], deck: ["V3"] } }).activate("FUSER@hand");
    expect([t.ex(), t.counters("FUSER", "fusion"), t.cemetery(), t.hand()]).toEqual([["FUSER"], 1, ["V1"], ["V3"]]);
    // A full EX area: only a card from it can be fused, to make room.
    const full = d({ me: { hand: ["FUSER", "V1"], ex: ["V3", ...n(4, "AMULET")] } }).activate("FUSER@hand");
    expect([full.ex(), full.cemetery(), full.hand()]).toEqual([[...n(4, "AMULET"), "FUSER"], ["V3"], ["V1"]]);
    expect(d({ me: { hand: ["FUSER", "V1"], ex: n(5, "AMULET") } }).canActivate("FUSER@hand")).toBe(false);
    const fused = d({ me: { hand: ["FUSER", "FUSEE"], deck: ["V1", "V3"] } }).activate("FUSER@hand");
    expect([fused.hand(), fused.cemetery()]).toEqual([["V1"], ["FUSEE"]]);
  });

  it("CR 10.6.2.3 — selections of different cards, and of cards with different names", () => {
    const t = d({ me: { hand: ["TWO-GRAVES"], cemetery: ["V3", "V5"] } }).play("TWO-GRAVES").pick("V5").pick("V3");
    expect(t.hand()).toEqual(["V5", "V3"]);
    const one = d({ me: { hand: ["TWO-GRAVES"], cemetery: ["V3", "V5"] } }).play("TWO-GRAVES").pick("V3");
    expect([one.hand(), one.cemetery()]).toEqual([["V3"], ["V5", "TWO-GRAVES"]]);
    const names = d({ me: { hand: ["NAMES"], cemetery: ["V1", "V1", "V3"] } }).play("NAMES").pick("V1");
    expect(names.decision?.type === "selectCards" ? names.decision.candidateDefs : []).toEqual(["V3"]);
    expect([names.pick("V3").hand(), names.cemetery()]).toEqual([["V1", "V3"], ["V1", "NAMES"]]);
  });
});
