// BP10-087 Moonrise Werewolf (Evolved) — Abysscraft follower, 2/2. アルカナ・獣.
// On Evolve - Select an enemy follower on the field and, if Sanguine is active for you, deal it 3
// damage.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.game.sanguine(fx.controller)) yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
