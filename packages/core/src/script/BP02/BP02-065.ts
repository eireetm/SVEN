// BP02-065 Dragontamer — Dragoncraft follower, 2, 2/2.
// {[evolve]}{[cost01]}: Evolve this follower.
// {[fanfare]} Draw a card, then discard a card.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
