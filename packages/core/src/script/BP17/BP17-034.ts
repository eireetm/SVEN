// BP17-034 Victorious Grappler — Swordcraft follower, 6, 5/6. 指揮官.
// Strike - Select an enemy follower on the field. Deal 3 damage to it and it's leader.
import { defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamageEach([target, fx.game.leader(fx.game.controller(target))], 3);
      },
    }),
  ],
});
