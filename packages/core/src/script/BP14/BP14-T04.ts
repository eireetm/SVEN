// BP14-T04 Tidal Tyranny — Dragoncraft spell token, 2. 宴楽・ドラゴニュート.
// Select an enemy follower on the field and deal it 4 damage. If Overflow is active for you, deal 6 damage
// instead.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.overflow(fx.controller) ? 6 : 4);
      },
    }),
  ],
});
