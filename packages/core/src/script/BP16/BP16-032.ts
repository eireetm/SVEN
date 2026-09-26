// BP16-032 Flashstep Quickblader (Evolved) — Swordcraft follower, 2/2. 兵士.
// Storm.
// On Evolve - Select an enemy leader or enemy follower on the field and deal it 1 damage.
import { defineCard, onEvolve } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    onEvolve({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
      },
    }),
  ],
});
