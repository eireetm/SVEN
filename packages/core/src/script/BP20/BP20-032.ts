// BP20-032 Comrade of the Swordmaster (Evolved) — 4/4.
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
