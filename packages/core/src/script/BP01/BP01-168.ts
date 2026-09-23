// BP01-168 Demonic Strike — Neutral spell, 3.
// Select an enemy leader or enemy follower on the field and deal it 3 damage.
import { defineCard, spell } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
