// BP16-053 William, Mysterian Student — Runecraft follower, 4, 3/5. 魔法使い・学院.
// {[fanfare]} Select an enemy follower on the field and deal it 4 damage.
// {[act]} {[cost02]}, engage this: Select an enemy follower on the field and deal it 4 damage.
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
    activated(
      { playPoints: 2, engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        },
      },
    ),
  ],
});
