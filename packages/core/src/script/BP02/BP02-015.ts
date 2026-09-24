// BP02-015 Forest Gigas (Evolved) — 3/7.
// Ward. // On Evolve: Select an enemy follower on the field and deal it X damage. X equals this
// follower's attack (its current attack when the effect resolves).
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.info(fx.self).attack ?? 0);
      },
    }),
  ],
});
