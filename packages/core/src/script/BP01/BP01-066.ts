// BP01-066 Price of Magic — Runecraft amulet, 3. Stack.
// {[fanfare]} Select an enemy follower with 4 defense or less on the field and banish it.
// (Current defense — cf. BP01-139 ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["stack"],
  abilities: [
    fanfare({
      targets: [enemyFollower({ filter: (g, id) => (g.info(id).defense ?? Infinity) <= 4 })],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});
