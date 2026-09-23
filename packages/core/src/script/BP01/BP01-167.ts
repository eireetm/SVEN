// BP01-167 Harnessed Glass — Neutral follower, 3, 2/3.
// {[fanfare]} Draw a card. Put a card from your hand on the bottom of your deck.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        const chosen = yield* fx.chooseCards(fx.game.cards(fx.controller, "hand"), 1, 1);
        yield* fx.putOnDeck(chosen, "bottom");
      },
    }),
  ],
});
