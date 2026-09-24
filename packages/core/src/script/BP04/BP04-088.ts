// BP04-088 Fenrir (Evolved) — Abysscraft, 4/6.
// During your turn, whenever this follower takes damage, select an enemy follower on the field and
// deal it 3 damage.
import { defineCard, whenThisTakesDamage } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    whenThisTakesDamage(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
      { onlyYourTurn: true },
    ),
  ],
});
