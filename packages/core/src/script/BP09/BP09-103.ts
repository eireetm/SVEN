// BP09-103 Marduk — Neutral follower, 6, 5/5. 大神.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Bury the top 2 cards of your deck.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.mill(2);
      },
    }),
  ],
});
