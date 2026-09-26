// BP11-083 Fulminating Berserker — Abysscraft follower, 7, 6/6. 魔界.
// Rush.
// Strike - Select an enemy follower on the field and deal it 5 damage.
import { defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
  ],
});
