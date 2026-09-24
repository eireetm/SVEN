// BP05-049 Servant of Destruction (Evolved) — Runecraft follower, 4/4. 絶傑・アイドル.
// On Evolve: Select an enemy follower on the field. Deal 2 damage to it and its leader. (No enemy
// follower: no leader damage either — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamageEach([target, fx.game.leader(fx.game.controller(target))], 2);
      },
    }),
  ],
});
