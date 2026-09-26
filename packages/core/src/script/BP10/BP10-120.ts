// BP10-120 Pureshot Angel (Evolved) — Neutral follower, 6/6. 天使.
// On Evolve - Select an enemy follower on the field. Deal 3 damage to it and its leader.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamageEach([target, fx.game.leader(fx.game.controller(target))], 3);
      },
    }),
  ],
});
