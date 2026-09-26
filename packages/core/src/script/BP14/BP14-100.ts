// BP14-100 Twinblade Featherfolk (Evolved) — Havencraft follower, 4/4. 鳥族.
// On Evolve - Select an enemy follower on the field and deal it 4 damage.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
