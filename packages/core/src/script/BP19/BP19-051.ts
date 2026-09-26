// BP19-051 Electrokitty (Evolved) — 3/3.
// On Evolve - Select an enemy leader or enemy follower on the field and deal it 2 damage.
import { defineCard, onEvolve } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
