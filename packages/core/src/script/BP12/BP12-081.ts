// BP12-081 Bloodstained Berserker (Evolved) — Abysscraft follower, 6/5. 魔界.
// Storm.
// On Evolve - Select an enemy follower on the field and destroy it.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
