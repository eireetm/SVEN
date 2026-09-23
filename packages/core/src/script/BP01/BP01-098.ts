// BP01-098 Blazing Breath — Dragoncraft spell, 1. {[quick]}
// Select an enemy follower on the field and deal it 2 damage. If Overflow is active for you,
// deal 4 damage instead. (4, not 6 — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.overflow(fx.controller) ? 4 : 2);
      },
    }),
  ],
});
