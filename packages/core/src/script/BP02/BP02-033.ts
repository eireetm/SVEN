// BP02-033 Flame Soldier — Swordcraft follower, 3, 3/3.
// {[fanfare]} Select an enemy follower on the field and deal it 1 damage. If any of your followers
// have been destroyed this turn, deal 4 damage instead. (Destroyed: CR 5.6, including by rules
// handling, 11.3.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.followersDestroyedThisTurn(fx.controller) > 0 ? 4 : 1);
      },
    }),
  ],
});
