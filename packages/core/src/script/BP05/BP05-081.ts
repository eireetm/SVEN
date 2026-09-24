// BP05-081 Servant of Lust (Evolved) — Abysscraft follower, 4/2. 絶傑・魔界.
// On Evolve, give your leader {[defense]}-1: Select an enemy follower on the field and deal it X
// damage. X equals the number of times your leader has lost defense this turn. (The cost counts —
// ruling.)
import { defineCard, onEvolve } from "../helpers";
import { leaderDefenseCost } from "../costs";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      cost: leaderDefenseCost(1),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.leaderDefenseLostThisTurn(fx.controller));
      },
    }),
  ],
});
