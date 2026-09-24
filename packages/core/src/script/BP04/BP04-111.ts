// BP04-111 Sister of Punishment — Havencraft follower, 2, 2/3. 狂信.
// Once per turn, when an amulet you control leaves the field, select an enemy follower on the
// field and deal it 2 damage.
import { defineCard, whenAnotherAmuletLeaves } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    whenAnotherAmuletLeaves({
      oncePerTurn: true,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
