// CP02-027 Karen Hojo (Evolved) — 2/2.
// On Evolve - Select an enemy follower on the field. Deal it and this follower 3 damage. (Without an enemy follower the ability
// isn't played and this takes no damage — ruling, CR 10.6.2.3.3.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamageEach([fx.targets[0]![0]!, fx.self], 3);
      },
    }),
  ],
});
