// BP07-074 Doublame, Duke and Dame (Evolved) — 3/3.
// On Evolve - Select an enemy follower on the field and deal it 2 damage. Necrocharge (10) - Deal 4
// damage instead. (CR 13.5.1.2)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.necrocharge(fx.controller, 10) ? 4 : 2);
      },
    }),
  ],
});
