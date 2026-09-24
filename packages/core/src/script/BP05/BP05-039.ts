// BP05-039 Apostle of Truth (Evolved) — Runecraft follower, 4/4. 絶傑・魔法使い.
// On Evolve: Select an enemy follower on the field and deal it X damage. X equals 2 times the
// number of Mage followers on your field.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { mageFollowers } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2 * mageFollowers(fx.game, fx.controller));
      },
    }),
  ],
});
