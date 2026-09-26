import { describe, expect, it } from "vitest";
import { createEngine, type CardDefinition, type CardScript, type PlayerId } from "../../src";
import { ALL_CARDS, ALL_SCRIPTS } from "../../src/sets";
import { drive, testFollower, testSpell, type DriveSpec } from "../../src/testing";
import { TEST_CARDS, TEST_SCRIPTS } from "../helpers";

// Engine behaviour added for BP10. V1 is 1c 2/2; QUICK-SAC destroys a follower of yours (0);
// FAN-DRAW draws a card on its Fanfare (1). Synthetic cards below: ADV / ADV-LW are advanced
// followers (CR 9.2); SUMMON-ADV / ADV-TO-EX take an advanced card from the evolve deck; BOUNCE
// returns one of your followers to the hand; NO-DRAW forbids its opponent to draw outside of their
// start phase (BP10-076).
const advanced = (def: CardDefinition): CardDefinition => ({ ...def, advanced: true });
const CARDS: CardDefinition[] = [
  advanced(testFollower("ADV", 3, 3, 3)),
  advanced(testFollower("ADV-LW", 3, 3, 3, { text: "Last Words: draw a card." })),
  // An advanced card named like a follower with an evolve ability: never its evolved card.
  advanced(testFollower("ADV-EVOLVER", 3, 3, 3, { name: "Evolver" })),
  testSpell("SUMMON-ADV", 0, { text: "You may summon an advanced follower from your evolve deck." }),
  testSpell("ADV-TO-EX", 0, { text: "You may put an advanced follower from your evolve deck into your EX area." }),
  testSpell("BOUNCE", 0, { text: "Select a follower on your field and return it to your hand." }),
  testFollower("NO-DRAW", 2, 2, 2, { text: "Opponents can't draw cards outside of their start phase." }),
];
const isAdvancedCard = (fx: { game: { card(id: string): { def: string } | undefined; db: { get(id: string): CardDefinition } } }) => (id: string) =>
  fx.game.db.get(fx.game.card(id)!.def).advanced === true;
const SCRIPTS: Record<string, CardScript> = {
  "ADV-LW": {
    abilities: [{ kind: "automatic", timing: "lastWords", trigger: (e, me) => me.lookBack && e.type === "cardsMoved" && e.moves.some((m) => m.card === me.card && m.from?.zone === "field" && m.to.zone === "cemetery"), *resolve(fx) { yield* fx.draw(1); } }],
  },
  "SUMMON-ADV": { abilities: [{ kind: "spell", *resolve(fx) { yield* fx.fromEvolveDeck(isAdvancedCard(fx), { to: "field" }); } }] },
  "ADV-TO-EX": { abilities: [{ kind: "spell", *resolve(fx) { yield* fx.fromEvolveDeck(isAdvancedCard(fx), { to: "ex" }); } }] },
  BOUNCE: {
    abilities: [
      {
        kind: "spell",
        targets: [{ count: 1, candidates: (g, c: PlayerId) => g.followers(c) }],
        *resolve(fx) {
          yield* fx.returnToHand(fx.targets[0]!);
        },
      },
    ],
  },
  "NO-DRAW": { field: { forbidsDraw: (g, self, player, startPhase) => player !== g.controller(self) && !startPhase } },
};
const E = createEngine({ cards: [...ALL_CARDS, ...TEST_CARDS, ...CARDS], scripts: { ...ALL_SCRIPTS, ...TEST_SCRIPTS, ...SCRIPTS } });
const d = (spec: DriveSpec) => drive(E, spec);
const faceUp = (t: ReturnType<typeof d>, p: PlayerId = 0) => t.game.reader().faceUpEvolveDeck(p).map((id) => t.game.state.cards[id]!.def);

describe("BP10 mechanics", () => {
  it("CR 6.1.1.2 / 6.1.1.3 — advanced cards go into the evolve deck, not the main deck", () => {
    const rules = { deckRestrictions: false, allowUnimplementedCards: true };
    expect(E.validateDeck({ main: ["V1"], evolve: ["ADV"] }, rules)).toEqual([]);
    expect(E.validateDeck({ main: ["V1", "ADV"], evolve: [] }, rules)).toEqual([
      "main deck: ADV ADV cannot be in the main deck (6.1.1.2, 9.1.4)",
    ]);
  });

  it("an advanced card is never the evolved card of a follower (CR 5.16.1.1, 9.2)", () => {
    expect(d({ me: { field: ["EVOLVER"], evolveDeck: ["ADV-EVOLVER"], playPoints: 2 } }).canEvolve("EVOLVER")).toBe(false);
  });

  it("CR 9.2.2 — destroyed, it goes to the cemetery (its Last Words trigger) and then faceup into the evolve deck", () => {
    const t = d({ me: { field: ["ADV-LW"], hand: ["QUICK-SAC"], deck: ["V1"] } }).play("QUICK-SAC");
    expect([t.cemetery(), faceUp(t), t.hand()]).toEqual([["QUICK-SAC"], ["ADV-LW"], ["V1"]]);
  });

  it("CR 9.2.2 — returned to the hand, it goes faceup into the evolve deck", () => {
    const t = d({ me: { field: ["ADV"], hand: ["BOUNCE"] } }).play("BOUNCE");
    expect([t.hand(), t.field(), faceUp(t)]).toEqual([[], [], ["ADV"]]);
    // It still counts as returned to the hand this turn.
    expect(t.game.reader().cardsReturnedToHandThisTurn(0)).toEqual([{ names: ["ADV"], type: "follower", traits: [] }]);
  });

  it("an effect summons an advanced card from the evolve deck (facedown ones only, CR 4.6.3); it may decline", () => {
    const t = d({ me: { hand: ["SUMMON-ADV", "SUMMON-ADV"], evolveDeck: ["ADV"], faceUpEvolveDeck: ["ADV-LW"] } }).play("SUMMON-ADV");
    expect(t.decision).toMatchObject({ type: "selectCards", min: 0, max: 1, candidateDefs: ["ADV"] });
    t.pick("ADV");
    expect([t.field(), t.game.state.players[0].zones.evolveDeck.length]).toEqual([["ADV"], 1]);
    t.play("SUMMON-ADV");
    expect(t.field()).toEqual(["ADV"]);
  });

  it("an advanced card put into the EX area is played from there like any card", () => {
    const t = d({ me: { hand: ["ADV-TO-EX"], evolveDeck: ["ADV"], playPoints: 3 } }).play("ADV-TO-EX").pick("ADV");
    expect(t.ex()).toEqual(["ADV"]);
    t.play("ADV");
    expect([t.field(), t.pp()]).toEqual([["ADV"], 0]);
  });

  it("CR 1.3.3 — a passive forbidding draws: the opponent's effect draws do nothing (no loss from an empty deck), the start phase draw works", () => {
    const t = d({ me: { hand: ["FAN-DRAW"], playPoints: 1 }, opp: { field: ["NO-DRAW"] } }).play("FAN-DRAW");
    expect([t.hand(), t.game.result, t.game.state.players[0].drewFromEmptyDeck]).toEqual([[], null, false]);
    const start = d({ turn: 6, me: { deck: ["V1", "V3"] }, opp: { field: ["NO-DRAW"], deck: ["V1"] } });
    // Player 1 ends the turn; player 0's turn begins with the start phase draw.
    start.game.act({ type: "mainPhase", action: { type: "endMainPhase" } });
    expect([start.decision?.type, start.decision?.player, start.hand()]).toEqual(["mainPhase", 0, ["V1"]]);
  });
});
