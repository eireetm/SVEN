// BP06-026 Quickdraw Maven (Evolved) — Swordcraft follower, 4/4. 兵士.
// On Evolve - Discard a card: Select an enemy follower on the field and deal it 5 damage.
import { defineCard, onEvolve } from "../helpers";
import { discardCardsCost } from "../costs";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      cost: discardCardsCost(1),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
  ],
});
