// BP17-T02 Gale Arrow — Forestcraft spell token, 1. エルフ族.
// Select an enemy follower on the field. Combo (3) - Deal it 2 damage. (The selection needs no Combo; CR 13.2.1.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.game.combo(fx.controller, 3)) yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
