// BP02-051 Red-Hot Ritual — Runecraft amulet, 2.
// Stack. (CR 13.3.2)
// {[fanfare]} Select an enemy follower on the field and deal it 3 damage.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["stack"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
