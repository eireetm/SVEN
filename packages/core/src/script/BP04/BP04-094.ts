// BP04-094 Frogbat — Abysscraft follower, 2, 2/2. 魔界・獣.
// {[evolve]} Banish 2 cards in your cemetery: Evolve this follower.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility({
      custom: {
        canPay: (g, c) => g.cards(c, "cemetery").length >= 2,
        *pay(fx) {
          yield* fx.banish(yield* fx.chooseCards(fx.game.cards(fx.controller, "cemetery"), 2, 2));
        },
      },
    }),
  ],
});
