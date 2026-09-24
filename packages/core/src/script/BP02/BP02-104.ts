// BP02-104 Sledgehammer Exorcist — Havencraft follower, 3, 4/3.
// {[fanfare]} {[cost02]} Select an enemy follower on the field and deal it 4 damage.
// (Optional play-point cost, CR 10.4.7.4 — ruling.)
import { defineCard, fanfare } from "../helpers";
import { playPointsCost } from "../costs";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: playPointsCost(2),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
