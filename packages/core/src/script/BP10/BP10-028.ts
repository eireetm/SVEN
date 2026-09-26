// BP10-028 Lightning Kicker (Evolved) — Swordcraft follower, 4/4. 兵士・ヒーロー.
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
