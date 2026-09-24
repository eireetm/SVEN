// BP05-031 Captain Meteo (Evolved) — Swordcraft follower, 8/8. 指揮官.
// On Evolve: Select an enemy follower on the field and destroy it.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
      },
    }),
  ],
});
