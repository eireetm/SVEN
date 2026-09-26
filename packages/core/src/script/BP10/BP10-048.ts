// BP10-048 Piquant Potioneer — Runecraft follower, 5, 4/4. 魔法使い・錬金術師.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Draw a card.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
