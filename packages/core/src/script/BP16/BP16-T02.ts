// BP16-T02 Looking Smart! — Runecraft spell token, 0. 魔法使い・学院.
// Select an enemy follower on the field. Deal it 2 damage, draw a card, then discard a card. (Not without a target —
// ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
