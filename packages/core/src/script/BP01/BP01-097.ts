// BP01-097 Dread Dragon — Dragoncraft follower, 7, 7/7.
// {[fanfare]} Select an enemy follower on the field and deal it 7 damage.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 7);
      },
    }),
  ],
});
