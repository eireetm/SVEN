// BP16-T08 Demon of Purgatory — Neutral follower token, 1, 6/4. 魔王.
// Ward.
// {[fanfare]} Select an enemy follower on the field and deal it 6 damage
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 6);
      },
    }),
  ],
});
