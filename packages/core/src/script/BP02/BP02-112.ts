// BP02-112 Surefire Bullet — Neutral spell, 2. {[quick]}
// Select an enemy follower on the field and deal it 3 damage. If it's an evolved follower, deal 4
// damage instead.
import { defineCard, spell } from "../helpers";
import { enemyFollower, isEvolved } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamage(target, isEvolved(fx.game, target) ? 4 : 3);
      },
    }),
  ],
});
