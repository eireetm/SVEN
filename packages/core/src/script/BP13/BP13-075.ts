// BP13-075 Ceres, Bride of the Night (Evolved) — Abysscraft follower, 2/5. 死者・キラー.
// Bane.
// On Evolve - Put a Darkest Desire token into your EX area.
// {[lastwords]} Select an enemy follower on the field and deal it 3 damage.
import { defineCard, lastWords, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { DARKEST_DESIRE } from "./shared-abyss";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx([DARKEST_DESIRE]);
      },
    }),
    lastWords({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
