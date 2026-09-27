// ECP02-068 Kotoka Saionji [Pure Euphoria] (Evolved) — 5/5.
// On Evolve - Select an enemy follower on the field and banish it.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});
