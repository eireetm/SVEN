// BP13-074 Ceres, Bride of the Night — Abysscraft follower, 3, 1/4. 死者・キラー.
// {[evolve]} {[cost01]}: Evolve this follower.
// Bane.
// {[lastwords]} Select an enemy follower on the field and deal it 3 damage.
import { defineCard, evolveAbility, lastWords } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    evolveAbility(1),
    lastWords({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
