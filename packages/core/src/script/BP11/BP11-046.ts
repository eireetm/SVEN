// BP11-046 Crystal Fencer — Runecraft follower, 3, 3/3. 魔法使い.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Draw a card. Discard a card.
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
