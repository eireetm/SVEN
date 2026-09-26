// BP11-016 Hornet Strike — Forestcraft spell, 2. 虫族.
// Select an enemy follower on the field and deal it 3 damage. Combo (3) - Deal 5 damage instead.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.combo(fx.controller, 3) ? 5 : 3);
      },
    }),
  ],
});
