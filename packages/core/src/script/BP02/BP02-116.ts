// BP02-116 Call of Cocytus — Neutral spell, 6. {[quick]}
// Select an enemy follower on the field. Destroy it, then search your deck for a {[neutral]}
// follower, reveal it, and add it to your hand. (Not playable without an enemy follower — ruling.)
import { defineCard, spell } from "../helpers";
import { and, enemyFollower, isClass, isFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.search((id) => and(isFollower, isClass("Neutral"))(fx.game, id));
      },
    }),
  ],
});
