// BP02-060 Siegfried (Evolved) — 3/3.
// On Evolve: Select an enemy follower with 3 defense or less on the field and destroy it.
// (Current defense, after damage — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower({ filter: (g, id) => (g.info(id).defense ?? Infinity) <= 3 })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
