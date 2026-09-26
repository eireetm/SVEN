import { describe, expect, it } from "vitest";
import { createEngine, script, type CardDefinition, type CardScript, type Keyword } from "../../src";
import { named } from "../../src/script/targets";
import { drive, testFollower, testSpell, type DriveSpec } from "../../src/testing";
import { TEST_CARDS, TEST_SCRIPTS } from "../helpers";

// Engine behaviour added for BP13, with synthetic cards. V1 is 1c 2/2, V5 5c 5/5; KILL a 1-cost spell
// destroying an enemy follower; EVOLVER has an evolve ability.
const { defineCard, activated, spell, playFromEvolveDeck } = script;
const CARDS: CardDefinition[] = [
  { ...testSpell("ADV-BLAST", 2), advanced: true }, // an advanced spell: 3 damage to the enemy leader
  testFollower("BLASTER", 1, 1, 1), // Activate: you may play an ADV-BLAST from your evolve deck
  testFollower("EX-RUSHER", 1, 1, 1), // while on your field or in your EX area, your other followers have Rush
  testSpell("GIFT", 0), // give control of a follower on your field to the opponent
  testFollower("EVOLVE-TEXT", 1, 1, 1, { text: "Fanfare: Select a follower with {[evolve]} in your cemetery." }),
];
const othersHaveRush = (g: import("../../src").GameReader, self: string, card: string): readonly Keyword[] =>
  card !== self && g.card(card)?.zone === "field" && g.controller(card) === g.controller(self) ? ["rush"] : [];
const SCRIPTS: Record<string, CardScript> = {
  "ADV-BLAST": defineCard({ abilities: [spell({ *resolve(fx) { yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 3); } })] }),
  BLASTER: defineCard({
    abilities: [
      activated(
        {},
        {
          *resolve(fx) {
            yield* playFromEvolveDeck(fx, named("ADV-BLAST"));
          },
        },
      ),
    ],
  }),
  "EX-RUSHER": defineCard({ field: { keywordsFor: othersHaveRush }, exPassives: { keywordsFor: othersHaveRush } }),
  GIFT: defineCard({
    abilities: [
      spell({
        *resolve(fx) {
          const [card] = yield* fx.chooseCards(fx.game.followers(fx.controller), 1, 1);
          if (card !== undefined) yield* fx.giveControl(card);
        },
      }),
    ],
  }),
};
const E = createEngine({ cards: [...TEST_CARDS, ...CARDS], scripts: { ...TEST_SCRIPTS, ...SCRIPTS } });
const d = (spec: DriveSpec) => drive(E, spec);
const main40 = Array<string>(40).fill("V1");

describe("BP13 mechanics", () => {
  it("CR 9.2 / 10.6.2 — an advanced spell is played from the evolve deck by an effect, paying its cost, and goes back faceup", () => {
    const t = d({ me: { field: ["BLASTER"], evolveDeck: ["ADV-BLAST"], playPoints: 3 } }).activate("BLASTER").pick("ADV-BLAST");
    const blast = t.game.state.cards[t.id("ADV-BLAST")]!;
    expect([t.leader("opp"), t.pp(), blast.zone, blast.faceUp]).toEqual([17, 1, "evolveDeck", true]);
    // CR 4.6.3 — faceup, it isn't part of the evolve deck any more: nothing to play.
    t.activate("BLASTER");
    expect([t.decision?.type, t.leader("opp")]).toEqual(["mainPhase", 17]);
  });

  it("CR 9.2 — playing it is optional and needs its cost; advanced cards go in the evolve deck (6.1.1.3)", () => {
    const no = d({ me: { field: ["BLASTER"], evolveDeck: ["ADV-BLAST"], playPoints: 3 } }).activate("BLASTER").none();
    expect([no.leader("opp"), no.game.state.cards[no.id("ADV-BLAST")]!.faceUp]).toEqual([20, false]);
    const poor = d({ me: { field: ["BLASTER"], evolveDeck: ["ADV-BLAST"], playPoints: 1 } }).activate("BLASTER");
    expect([poor.decision?.type, poor.leader("opp")]).toEqual(["mainPhase", 20]);
    const problems = (deck: { main: string[]; evolve: string[] }) => E.validateDeck(deck, { deckRestrictions: false }).filter((p) => p.includes("ADV-BLAST"));
    expect(problems({ main: main40, evolve: ["ADV-BLAST"] })).toEqual([]);
    expect(problems({ main: [...main40.slice(1), "ADV-BLAST"], evolve: [] })).toHaveLength(1);
  });

  it("CR 10.3.5 — a passive that also works in the EX area", () => {
    expect(d({ me: { ex: ["EX-RUSHER"], field: ["V1"] } }).keywords("V1")).toEqual(["rush"]);
    expect(d({ me: { field: ["EX-RUSHER", "V1"] } }).keywords("V1")).toEqual(["rush"]);
    expect(d({ me: { hand: ["EX-RUSHER"], cemetery: ["EX-RUSHER"], field: ["V1"] } }).keywords("V1")).toEqual([]);
    expect(d({ me: { ex: ["EX-RUSHER"] }, opp: { field: ["V1"] } }).keywords("opp:V1")).toEqual([]);
  });

  it("CR 5.22.2 — a given card keeps its state (5.22.4), attacks for its new controller from their next turn, and goes to its owner's zones (5.22.5)", () => {
    const t = d({ me: { hand: ["GIFT", "KILL"], field: [{ card: "V5", damage: 2 }], deck: ["V1"] }, opp: { deck: ["V1"] } }).play("GIFT");
    expect([t.field(), t.field("opp"), t.stats("opp:V5"), t.game.state.cards[t.id("opp:V5")]!.owner]).toEqual([[], ["V5"], [5, 3], 0]);
    const kill = d({ me: { hand: ["GIFT", "KILL"], field: ["V1"], playPoints: 1 } }).play("GIFT").play("KILL");
    expect([kill.field("opp"), kill.cemetery("opp"), kill.cemetery()]).toEqual([[], [], ["GIFT", "V1", "KILL"]]);
    // It has been on the opponent's field since the start of their turn: it can attack then (CR 8.4.2.1).
    t.end();
    const d2 = t.game.decision;
    expect(d2?.type === "mainPhase" && d2.actions.some((a) => a.type === "attack" && a.attacker === t.id("opp:V5"))).toBe(true);
    // A full field can't take it: it stays.
    const full = d({ me: { hand: ["GIFT"], field: ["V1"] }, opp: { field: ["V5", "V5", "V5", "V5", "V5"] } }).play("GIFT");
    expect(full.field()).toEqual(["V1"]);
  });

  it("CR 12.2 — having an evolve ability is read from the script, not from the text", () => {
    const g = d({}).game.reader();
    expect([g.hasEvolveAbility("EVOLVER"), g.hasEvolveAbility("EVOLVE-TEXT"), g.hasEvolveAbility("V1")]).toEqual([true, false, false]);
  });
});
