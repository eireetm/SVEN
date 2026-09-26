// BP11-060 Azureflame Dragonewt (Evolved) — Dragoncraft follower, 7/7. ドラゴニュート.
// On Evolve - Select an enemy follower on the field and deal it 6 damage.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 6);
      },
    }),
  ],
});
