// BP01-094 Fire Lizard — Dragoncraft follower, 2, 3/2.
// {[fanfare]} Select an enemy leader or enemy follower on the field and deal it 1 damage.
import { defineCard, fanfare } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
      },
    }),
  ],
});
