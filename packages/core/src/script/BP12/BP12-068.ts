// BP12-068 Overwhelming Crush — Dragoncraft spell, 5. 竜族.
// Select an enemy follower on the field. Destroy it, search your deck for a {[dragoncraft]} follower,
// reveal it, add it to your hand, then shuffle. (Not playable without a target — ruling.)
import { defineCard, spell } from "../helpers";
import { and, enemyFollower, isClass, isFollower } from "../targets";

const dragoncraftFollower = and(isFollower, isClass("Dragoncraft"));

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.search((id) => dragoncraftFollower(fx.game, id));
      },
    }),
  ],
});
