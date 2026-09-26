// BP18-030 Lucius, Sellsword — Swordcraft follower, 1, 2/2. 傭兵.
// {[fanfare]} {[cost03]} Select an enemy follower on the field and destroy it. (The play points are paid as it is played,
// after the target is selected — CR 10.4.7.4, 10.6.2.3.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: playPointsCost(3),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
