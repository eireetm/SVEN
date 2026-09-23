// BP01-017 Elf Metallurgist — Forestcraft follower, 2, 3/2.
// {[fanfare]} Select an enemy follower on the field and deal it 1 damage. Combo (3): Deal 3
// damage instead.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.combo(fx.controller, 3) ? 3 : 1);
      },
    }),
  ],
});
