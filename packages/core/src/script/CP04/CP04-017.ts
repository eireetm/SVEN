// CP04-017 Suzuna — Forestcraft follower, 3, 5/5. プリコネ・ルーセント学院.
// {[ub]} Activate {[engage]} this: Select an enemy follower on the field and deal it 3 damage.
// {[fanfare]} Discard a card.
import { activated, defineCard, fanfare, ub } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    ub(
      activated(
        { engageSelf: true },
        {
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 3);
          },
        },
      ),
    ),
    fanfare({
      *resolve(fx) {
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
