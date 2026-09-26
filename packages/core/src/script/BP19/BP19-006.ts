// BP19-006 Verdant Lieutenant (Evolved) — 3/3.
// Whenever a Condemned follower on your field evolves, Combo (3) - Draw a card.
// On Evolve - Select an enemy follower on the field and deal it 2 damage.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { lieutenantDraw } from "./shared-forest";

export default defineCard({
  abilities: [
    lieutenantDraw,
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
