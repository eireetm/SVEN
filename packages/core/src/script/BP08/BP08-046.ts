// BP08-046 Moonshade Mage — Runecraft follower, 8, 6/6. 魔法使い・魔法生物.
// Ward.
// {[fanfare]} Draw 3 cards. Discard 2 cards.
// Activate {[engage]}, discard a card: Select an enemy follower on the field and deal it 6 damage.
import { discardCardsCost } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(3);
        yield* fx.discard(fx.controller, 2, 2);
      },
    }),
    activated(
      { engageSelf: true, custom: discardCardsCost(1) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 6);
        },
      },
    ),
  ],
});
