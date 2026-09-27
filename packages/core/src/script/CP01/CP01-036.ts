// CP01-036 Kawakami Princess — Runecraft follower, 4, 4/4. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]} Discard a card: Select an enemy follower on the field and deal it 4 damage. (CR 10.4.7.4.)
import { discardCardsCost } from "../costs";
import { defineCard, fanfare, serveAbility } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      cost: discardCardsCost(1),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
