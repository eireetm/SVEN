// BP06-098 Holy Lancer (Evolved) — Havencraft follower, 4/5. 先導.
// Ward.
// On Evolve: Select an enemy follower on the field and deal it 4 damage
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
