// BP17-046 Marie, Flowery Magician (Evolved) — Runecraft follower, 3/3. 魔法使い.
// On Evolve - Select an enemy follower on the field and deal it 5 damage.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
  ],
});
