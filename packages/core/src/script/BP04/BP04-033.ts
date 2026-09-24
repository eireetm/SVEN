// BP04-033 Flail Knight — Swordcraft follower, 2, 2/3. 兵士.
// Strike: Select an enemy follower on the field. Deal 1 damage to it and its leader (at the same
// time, CR 5.14).
import { defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamages([
          { target, amount: 1 },
          { target: fx.game.leader(fx.game.controller(target)), amount: 1 },
        ]);
      },
    }),
  ],
});
