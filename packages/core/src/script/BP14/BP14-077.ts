// BP14-077 Eternal Contract — Abysscraft spell, 1. 宴楽・魔界.
// {[act]} {[cost01]}, banish this from your cemetery: Select up to 3 cards in your cemetery and/or banished zone
// named Paracelise, Demon of Greed and shuffle them into your deck. You may turn any faceup cards in your evolve
// deck named Paracelise, Demon of Greed facedown. (Valid in the cemetery; with none selected the deck is still
// shuffled — rulings. CR 4.6.3)
// ----------
// Do the following 2 times. "Put the top card of your deck into your EX area. Banish a card from your hand."
// (Each part happens as far as it can — rulings.)
import type { TargetSpec } from "../types";
import { banishThisFromCemetery } from "../costs";
import { activated, defineCard, spell } from "../helpers";
import { named } from "../targets";
import { PARACELISE } from "./shared-abyss";

const paraceliseBack: TargetSpec = {
  count: 3,
  upTo: true,
  candidates: (g, c) => [...g.cards(c, "cemetery"), ...g.cards(c, "banished")].filter((id) => named(PARACELISE)(g, id)),
};

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        for (let i = 0; i < 2; i++) {
          yield* fx.topToEx(1);
          const hand = fx.game.cards(fx.controller, "hand");
          yield* fx.banish(yield* fx.chooseCards(hand, Math.min(1, hand.length), 1));
        }
      },
    }),
    activated(
      { playPoints: 1, custom: banishThisFromCemetery },
      {
        validIn: ["cemetery"],
        targets: [paraceliseBack],
        *resolve(fx) {
          yield* fx.putOnDeck(fx.targets[0] ?? [], "top");
          yield* fx.shuffleDeck();
          const faceUp = fx.game.faceUpEvolveDeck(fx.controller).filter((id) => named(PARACELISE)(fx.game, id));
          yield* fx.turnFacedown(yield* fx.chooseCards(faceUp, 0, faceUp.length));
        },
      },
    ),
  ],
});
