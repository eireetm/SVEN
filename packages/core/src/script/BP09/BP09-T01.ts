// BP09-T01 Instant Poison — Runecraft spell token, 2. 錬金術師・禁忌.
// Select an enemy follower on the field. Deal 4 damage to it and 2 damage to its leader. (Without a
// target it can't be played — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamages([
          { target, amount: 4 },
          { target: fx.game.leader(fx.game.controller(target)), amount: 2 },
        ]);
      },
    }),
  ],
});
