// BP18-053 Carbuncle of Mysteria — Runecraft follower, 2, 2/2. 魔法生物・学院.
// {[evolve]} {[cost01]}: Evolve this.
// {[lastwords]} Bury the top card of your deck.
import { defineCard, evolveAbility, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    lastWords({
      *resolve(fx) {
        yield* fx.mill(1);
      },
    }),
  ],
});
