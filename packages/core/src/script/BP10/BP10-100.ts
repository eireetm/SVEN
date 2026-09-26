// BP10-100 Topaz Swordian (Evolved) — Havencraft follower, 3/4. 信仰.
// Ward.
// On Evolve - Select an enemy follower with 3 defense or less on the field and destroy it.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower({ filter: (g, id) => (g.info(id).defense ?? Infinity) <= 3 })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
