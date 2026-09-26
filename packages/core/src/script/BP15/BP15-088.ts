// BP15-088 Adherent of Screams — Abysscraft follower, 2, 2/2. 絶傑・死霊術師.
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
