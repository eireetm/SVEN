// BP01-022 Mana Elk — Forestcraft follower, 4, 5/5.
// Whenever one of your Pixie followers attacks, select an enemy leader or enemy follower on the
// field and deal it 1 damage.
import { defineCard, whenYourFollowerAttacks } from "../helpers";
import { enemyLeaderOrFollower, hasTrait } from "../targets";

export default defineCard({
  abilities: [
    whenYourFollowerAttacks(
      {
        targets: [enemyLeaderOrFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
      hasTrait("妖精"),
    ),
  ],
});
