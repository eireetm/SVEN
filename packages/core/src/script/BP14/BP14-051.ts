// BP14-051 Magical Reserves — Runecraft spell, 6. 魔法使い.
// Draw 2 cards. Deal each enemy follower on the field damage equal to the number of cards in your hand.
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.draw(2);
        yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), fx.game.cards(fx.controller, "hand").length);
      },
    }),
  ],
});
