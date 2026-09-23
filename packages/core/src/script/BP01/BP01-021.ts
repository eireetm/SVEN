// BP01-021 Okami — Forestcraft follower, 4, 5/5.
// Whenever another follower is put onto your field, give this follower +1/+1.
// (Not when a follower evolves, nor when a full field stops it entering — rulings.)
import { defineCard, whenFollowerEntersYourField } from "../helpers";

export default defineCard({
  abilities: [
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          yield* fx.giveStats(fx.self, 1, 1);
        },
      },
      { another: true },
    ),
  ],
});
