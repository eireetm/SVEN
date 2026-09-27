// CP04-086 Misaki (Evolved) — Abysscraft, 2/2. プリコネ・ルーセント学院.
// {[ub]} Strike - Select an enemy follower on the field and deal it 3 damage.
import { defineCard, strike, ub } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    ub(
      strike({
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      }),
    ),
  ],
});
