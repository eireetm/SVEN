// BP01-139 Blackened Scripture — Havencraft spell, 2. {[quick]}
// Select an enemy follower with 3 defense or less on the field and banish it. (Current defense —
// ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower({ filter: (g, id) => (g.info(id).defense ?? Infinity) <= 3 })],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});
