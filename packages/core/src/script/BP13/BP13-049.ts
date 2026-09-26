// BP13-049 Magical Squirrel (Evolved) — Runecraft follower, 2/2. 魔法生物・獣.
// On Evolve - Select an enemy follower on the field. Deal 1 damage to it and its leader.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamageEach([target, fx.game.leader(fx.game.controller(target))], 1);
      },
    }),
  ],
});
