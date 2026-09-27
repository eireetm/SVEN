// CP02-073 Takumi Mukai (Evolved) — 4/4.
// On Evolve - Select an enemy follower on the field. Destroy it and deal 3 damage to your leader. (Without an enemy follower
// nothing happens — ruling, CR 10.6.2.3.3.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.dealDamage(fx.game.leader(fx.controller), 3);
      },
    }),
  ],
});
