// BP17-064 Forestclaw Sentinel (Evolved) — Dragoncraft follower, 4/4. 自然・獣.
// On Evolve - Select an enemy follower on the field and deal it 3 damage.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
