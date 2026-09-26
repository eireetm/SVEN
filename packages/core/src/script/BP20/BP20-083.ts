// BP20-083 Spirited Gravekeeper — Abysscraft follower, 2, 2/3. 死霊術師.
// {[evolve]} {[cost05]}: Evolve this.
// {[fanfare]} Bury the top 2 cards of your deck.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(5),
    fanfare({
      *resolve(fx) {
        yield* fx.mill(2);
      },
    }),
  ],
});
