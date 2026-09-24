// BP02-120 Dance of Death — Neutral spell, 4.
// Select an enemy follower on the field. Deal 5 damage to it and 2 damage to its leader (at the same
// time, CR 5.14).
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamages([
          { target, amount: 5 },
          { target: fx.game.leader(fx.game.controller(target)), amount: 2 },
        ]);
      },
    }),
  ],
});
