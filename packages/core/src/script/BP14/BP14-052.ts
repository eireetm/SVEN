// BP14-052 Grand Spire — Runecraft amulet, 1. 魔法使い・土の印.
// Stack.
// {[fanfare]} Select an enemy follower on the field and deal it 2 damage.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["stack"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
