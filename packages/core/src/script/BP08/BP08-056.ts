// BP08-056 Annerose (Evolved) — Dragoncraft follower, 3/3. ドラゴニュート・プリンセス.
// On Evolve — Select an enemy follower and deal it 2 damage (CR 5.14, 12.6.1).
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
