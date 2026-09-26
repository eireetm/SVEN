// BP12-072 Jackshovel Gravedigger — Abysscraft follower, 2, 0/1. 機械・死霊術師.
// {[evolve]} {[cost01]}: Evolve this follower.
// Bane.
// {[fanfare]} If this card was put onto the field by an ability, evolve it. (Also during the opponent's
// turn; not counted as the turn's evolve — rulings.)
import { defineCard, enteredByAbility, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (enteredByAbility(fx) && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
