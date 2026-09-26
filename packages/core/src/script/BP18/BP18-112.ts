// BP18-112 Mugnier, Purifying Light — Havencraft follower, 4, 4/4. 狂信.
// {[fanfare]} Select an enemy follower on the field that costs 3 or less and banish it. (元のコスト; an evolved follower's is
// its base card's — ruling, CR 5.16.1.2.)
import { defineCard, fanfare } from "../helpers";
import { costAtMost, enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower({ filter: costAtMost(3) })],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});
