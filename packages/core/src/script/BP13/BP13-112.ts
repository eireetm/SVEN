// BP13-112 Managrocer — Neutral follower, 4, 4/4. 商人.
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
