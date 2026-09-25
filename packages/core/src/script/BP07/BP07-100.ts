// BP07-100 Meowskers, Ruff-Tuff Major — Havencraft follower, 2, 1/3. 自然・光輝・獣.
// Storm.
// Strike - Select an enemy leader or enemy follower on the field and deal it 1 damage.
import { defineCard, strike } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    strike({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
      },
    }),
  ],
});
