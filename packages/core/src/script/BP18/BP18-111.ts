// BP18-111 Votary of Contemplation (Evolved) — 3/3.
// On Evolve - Select an enemy follower on the field. Deal it 2 damage and, if your leader has gained {[defense]} this turn,
// deal 2 damage to its leader. (CR 5.27.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 2);
        if (fx.game.leaderDefenseGainedThisTurn(fx.controller) > 0) yield* fx.dealDamage(leader, 2);
      },
    }),
  ],
});
