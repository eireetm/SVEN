// BP19-014 Beast Lancer (Evolved) — 4/6.
// Ward.
// On Evolve - Select an enemy follower on the field and deal it 3 damage.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
