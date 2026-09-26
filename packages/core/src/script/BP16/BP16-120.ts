// BP16-120 Divine Thunder — Neutral spell, 5. 大神.
// Select an enemy follower on the field. Deal 7 damage to it and 3 damage to its leader.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamages([
          { target, amount: 7 },
          { target: fx.game.leader(fx.game.controller(target)), amount: 3 },
        ]);
      },
    }),
  ],
});
