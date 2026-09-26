// BP11-090 Vengeful Sniper (Evolved) — Havencraft follower, 4/4. 荒野・信仰.
// Ward.
// On Evolve - Select an enemy follower with 3 defense or less on the field and banish it.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower({ filter: (g, id) => (g.info(id).defense ?? Infinity) <= 3 })],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});
