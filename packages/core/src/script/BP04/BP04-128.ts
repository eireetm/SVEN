// BP04-128 Owlcat (Evolved) — Neutral, 3/3.
// On Evolve: Select an enemy follower with 1 attack or less, or with 1 defense, on the field and
// banish it.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [
        enemyFollower({
          filter: (g, id) => (g.info(id).attack ?? 99) <= 1 || g.info(id).defense === 1,
        }),
      ],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});
