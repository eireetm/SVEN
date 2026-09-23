// BP01-043 Fervid Soldier — Swordcraft follower, 2, 2/2.
// {[evolve]}{[cost02]}: Evolve this follower.
// Whenever another follower is put onto your field, give this follower +1 attack.
import { defineCard, evolveAbility, whenFollowerEntersYourField } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2),
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          yield* fx.giveStats(fx.self, 1, 0);
        },
      },
      { another: true },
    ),
  ],
});
