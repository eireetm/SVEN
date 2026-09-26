// BP15-093 Astral Projection — Abysscraft spell, 4. 死者・死霊術師.
// {[quick]}
// Select an enemy follower on the field. Destroy it and bury the top 2 cards of your deck. (Not playable without
// a target — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.mill(2);
      },
    }),
  ],
});
