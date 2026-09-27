// SD06-004 Priest of the Cudgel (Evolved) — 4/4.
// On Evolve: Select an enemy follower with 3 or less defense on the field and banish it.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower({ filter: (g, id) => (g.info(id).defense ?? 0) <= 3 })],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});
