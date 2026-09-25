// BP06-005 Wildwood Matriarch — Forestcraft follower, 4, 3/3. 狩人.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} If this card was put onto the field by an ability, evolve it.
// Rulings: by Lymaga's abilities it evolves, also in the opponent's turn; that evolution is not
// this turn's evolve ability (CR 8.3.2.1).
import { defineCard, enteredByAbility, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        if (enteredByAbility(fx)) yield* fx.evolve(fx.self);
      },
    }),
  ],
});
