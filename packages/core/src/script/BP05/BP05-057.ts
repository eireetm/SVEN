// BP05-057 God Bullet Golem — Dragoncraft follower, 6, 7/7. 巨人・超克.
// This follower can't attack enemy leaders.
// Activate {[engage]}, put another follower from your field into its owner's cemetery: Select an
// enemy leader or enemy follower on the field and deal it X damage. X equals the attack of the
// follower you put into the cemetery. (Its attack just before, with changes; evolved followers
// and tokens too — rulings.)
import { activated, defineCard } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  cannotAttackLeader: () => true,
  abilities: [
    activated(
      {
        engageSelf: true,
        custom: {
          canPay: (g, c, self) => g.followers(c).some((id) => id !== self),
          *pay(fx) {
            const others = fx.game.followers(fx.controller).filter((id) => id !== fx.self);
            const [chosen] = yield* fx.chooseCards(others, 1, 1);
            fx.memory.x = fx.game.info(chosen!).attack ?? 0;
            yield* fx.bury([chosen!]);
          },
        },
      },
      {
        targets: [enemyLeaderOrFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, Number(fx.memory.x ?? 0));
        },
      },
    ),
  ],
});
