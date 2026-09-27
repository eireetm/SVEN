// CP04-102 Threading Snare — Havencraft amulet, 2. プリコネ・カルミナ.
// {[fanfare]} Select an enemy follower on the field and deal it 3 damage.
// Whenever this becomes engaged, select an enemy leader or enemy follower on the field and deal it 1 damage.
// {[lastwords]} Select an enemy leader or enemy follower on the field and deal it 1 damage.
import { defineCard, fanfare, lastWords, whenThisBecomesEngaged } from "../helpers";
import { enemyFollower, enemyLeaderOrFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
    whenThisBecomesEngaged({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
      },
    }),
    lastWords({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
      },
    }),
  ],
});
