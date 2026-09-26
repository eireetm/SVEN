// BP17-028 Valhorean Dealer (Evolved) — Swordcraft follower, 5/5. 兵士・商人.
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
