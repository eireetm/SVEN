// BP19-082 Underworld Lieutenant — Abysscraft follower, 2, 2/2. 八獄・死者.
// {[evolve]} {[cost01]}: Evolve this.
// {[evolve]} {[cost00]}: Evolve this. Activate only if this was summoned from the cemetery. (Put onto the field from it.)
// {[lastwords]} Bury the top card of your deck.
import { defineCard, evolveAbility, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    evolveAbility(0, { condition: (g, _c, self) => g.enteredFrom(self) === "cemetery" }),
    lastWords({
      *resolve(fx) {
        yield* fx.mill(1);
      },
    }),
  ],
});
