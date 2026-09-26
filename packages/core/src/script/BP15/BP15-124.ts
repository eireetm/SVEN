// BP15-124 Nomadic Conductor (Evolved) — Neutral follower, 2/2. 傭兵・シンガー.
// On Evolve - Draw a card. Put a card from your hand on the bottom of your deck.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.putOnDeck(yield* fx.chooseCards(fx.game.cards(fx.controller, "hand"), 1, 1), "bottom");
      },
    }),
  ],
});
