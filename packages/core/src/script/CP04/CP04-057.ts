// CP04-057 Homare — Dragoncraft follower, 5, 4/5. プリコネ・ドラゴンズネスト.
// {[ub]} Activate {[engage]} this: Select an enemy follower on the field. Deal it 5 damage and, if Overflow is active for you,
// recover 2 play points. (Without an enemy follower it can't be activated — ruling.)
// {[fanfare]} Increase your max play points by 1.
// Whenever a {[ub]} ability of another follower on your field is executed, increase your max play points by 1.
import { activated, defineCard, fanfare, ub, whenAnotherFollowersUnionBurst } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    ub(
      activated(
        { engageSelf: true },
        {
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 5);
            if (fx.game.overflow(fx.controller)) yield* fx.recoverPlayPoints(2);
          },
        },
      ),
    ),
    fanfare({
      *resolve(fx) {
        yield* fx.increaseMaxPlayPoints(1);
      },
    }),
    whenAnotherFollowersUnionBurst({
      *resolve(fx) {
        yield* fx.increaseMaxPlayPoints(1);
      },
    }),
  ],
});
