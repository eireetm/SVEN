// BP14-T05 Wolfling's Struggle — Abysscraft spell token, 0. 宴楽・魔界・獣.
// Select an enemy follower on the field. Deal it 1 damage, and you may discard a card. If you do, bury the top
// card of your deck. (Not playable without a target — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        if ((yield* fx.discard(fx.controller, 0, 1)).length > 0) yield* fx.mill(1);
      },
    }),
  ],
});
