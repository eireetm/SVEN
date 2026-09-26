// BP08-081 Marian the Mummy — Abysscraft follower, 3, 3/3. 死者.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Bury the top 2 cards of your deck (CR 5.34, 12.4.3).
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
