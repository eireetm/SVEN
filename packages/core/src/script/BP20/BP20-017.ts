// BP20-017 Cutie Cat — Forestcraft follower, 5, 4/4. 獣.
// Storm.
// Strike - Select an enemy follower on the field and deal it 4 damage.
import { defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
