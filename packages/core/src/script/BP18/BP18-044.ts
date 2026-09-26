// BP18-044 Bejeweled Supermodel (Evolved) — 4/4.
// On Evolve - Select an enemy follower on the field and deal it damage equal to the number of cards in your banished zone.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { banishedCount } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const n = banishedCount(fx.game, fx.controller);
        if (n > 0) yield* fx.dealDamage(fx.targets[0]![0]!, n);
      },
    }),
  ],
});
