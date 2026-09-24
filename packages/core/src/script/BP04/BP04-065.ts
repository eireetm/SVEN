// BP04-065 Star Phoenix (Evolved) — Dragoncraft, 4/4.
// Strike: Select an enemy follower on the field and deal it 2 damage.
import { defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
