// BP06-008 Woodland Cleaver — Forestcraft follower, 2, 2/2. 狩人.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} If this card was put onto the field by an ability, give it Storm. (Played by an
// effect is played, not put there by an ability — ruling.)
import { defineCard, enteredByAbility, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (enteredByAbility(fx)) yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
