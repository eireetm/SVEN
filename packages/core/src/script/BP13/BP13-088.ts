// BP13-088 Jeanne, Despair's Maiden — Havencraft follower, 2, 3/2. 狂信・キラー.
// {[evolve]} {[cost05]}: Evolve this follower.
// {[fanfare]} Give your leader {[defense]}-2: Select an enemy follower that costs 2 or less on the field and
// destroy it. (元のコスト; CR 10.4.5: the leader needs at least 2 defense.)
import { leaderDefenseCost } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { costAtMost, enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(5),
    fanfare({
      cost: leaderDefenseCost(2),
      targets: [enemyFollower({ filter: costAtMost(2) })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
