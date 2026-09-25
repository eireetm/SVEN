// BP07-076 Nicola, Forbidden Strength — Abysscraft follower, 3, 3/3. 機械・死者.
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
