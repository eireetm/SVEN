// BP05-096 Silver Cog Spinner — Havencraft follower, 4, 5/4. 先導・光輝.
// {[fanfare]} If there are at least 5 cards in your hand, recover 2 play points. If there are 5 or
// less cards, draw a card. (Exactly 5: both; 4: draw only — the text is done in order, rulings.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.cards(fx.controller, "hand").length >= 5) yield* fx.recoverPlayPoints(2);
        if (fx.game.cards(fx.controller, "hand").length <= 5) yield* fx.draw(1);
      },
    }),
  ],
});
