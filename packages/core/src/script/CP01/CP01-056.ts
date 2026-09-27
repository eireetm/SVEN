// CP01-056 Nice Nature — Abysscraft follower, 3, 3/3. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]} Select an enemy follower on the field and give it {[attack]}-1/{[defense]}-1.
// {[lastwords]} Each opponent discards a card.
import { defineCard, fanfare, lastWords, serveAbility } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, -1, -1);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.discard(fx.game.opponent(fx.controller), 1, 1);
      },
    }),
  ],
});
