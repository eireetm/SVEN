// BP03-118 Angel of Darkness — Neutral follower, 3, 3/4. 堕天使.
// Activate {[engage]}, bury a Fallen Angel follower from your field: Deal 4 to an enemy follower.
import { activated, defineCard } from "../helpers";
import { enemyFollower, hasTrait, isFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      {
        engageSelf: true,
        custom: {
          canPay: (g, c) => g.followers(c).some((id) => isFollower(g, id) && hasTrait("堕天使")(g, id)),
          *pay(fx) {
            const cards = fx.game.followers(fx.controller).filter((id) => hasTrait("堕天使")(fx.game, id));
            yield* fx.bury(yield* fx.chooseCards(cards, 1, 1));
          },
        },
      },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        },
      },
    ),
  ],
});
