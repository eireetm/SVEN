// BP15-125 Mountain Gigas — Neutral follower, 7, 7/7. 巨人.
// Rush. Ward.
// {[fanfare]} Select an enemy follower on the field and deal it 7 damage.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["rush", "ward"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 7);
      },
    }),
  ],
});
