// BP16-035 Ignominious Samurai — Swordcraft follower, 4, 4/4. 兵士.
// Assail.
// Strike - Select an enemy follower on the field and deal it 4 damage.
import { defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
