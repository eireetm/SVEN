// BP04-126 Mystic Ring — Neutral spell, 1. 光輝. Quick.
// Put a card from your hand on the bottom of your deck. Draw a card. (With no other card in hand it
// just draws; this spell is not in the hand any more — rulings.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        const hand = fx.game.cards(fx.controller, "hand");
        if (hand.length > 0) yield* fx.putOnDeck(yield* fx.chooseCards(hand, 1, 1), "bottom");
        yield* fx.draw(1);
      },
    }),
  ],
});
