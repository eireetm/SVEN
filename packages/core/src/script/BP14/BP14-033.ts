// BP14-033 Hasty Axeman — Swordcraft follower, 5, 7/6. 兵士.
// {[fanfare]} Select an enemy follower on the field and engage it.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.engage(fx.targets[0]!);
      },
    }),
  ],
});
