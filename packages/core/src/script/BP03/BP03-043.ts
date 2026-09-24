// BP03-043 Milady, Mystic Queen (Evolved) — Runecraft, 3/3.
// On Evolve: Deal X to an enemy follower. X equals Chess followers on your field.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const x = fx.game.followers(fx.controller).filter((id) => hasTrait("チェス")(fx.game, id)).length;
        yield* fx.dealDamage(fx.targets[0]![0]!, x);
      },
    }),
  ],
});
