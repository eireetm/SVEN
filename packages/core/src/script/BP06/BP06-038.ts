// BP06-038 Mysteria, Magic Founder (Evolved) — Runecraft follower, 3/5. 魔法使い・学院.
// On Evolve - Select an enemy follower on the field and deal it 3 damage.
// While this card is on your field, any Academic follower you play costs 1 less.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { academicDiscount } from "./shared";

export default defineCard({
  field: academicDiscount,
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
