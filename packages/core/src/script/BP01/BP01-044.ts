// BP01-044 Fervid Soldier (Evolved) — 4/4.
// Whenever another follower is put onto your field, give this follower +1 attack.
import { defineCard, whenFollowerEntersYourField } from "../helpers";

export default defineCard({
  abilities: [
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
