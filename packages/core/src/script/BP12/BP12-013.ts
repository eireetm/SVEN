// BP12-013 Forest Hatcheteer (Evolved) — Forestcraft follower, 6/6. エルフ族・狩人.
// Strike - Select an enemy follower on the field. Destroy it and deal 3 damage to its leader.
import { defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.destroy([target]);
        yield* fx.dealDamage(leader, 3);
      },
    }),
  ],
});
