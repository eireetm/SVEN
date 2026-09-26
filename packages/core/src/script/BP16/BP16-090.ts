// BP16-090 Mino, Shrewd Reaper — Abysscraft follower, 1, 1/1. 魔界・死者.
// Activate {[engage]} this: Select an enemy follower on the field and deal it 3 damage. Activate only if there are at
// least 10 cards in your cemetery.
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        condition: (g, p) => g.cards(p, "cemetery").length >= 10,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
    ),
  ],
});
