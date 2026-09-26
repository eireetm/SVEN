// BP08-085 Manifest Malice — Abysscraft spell, 2. 死霊術師.
// Select an enemy follower and deal it 3 damage. Then you may banish 4 cards from your cemetery; if
// you do, return this resolving spell to its owner's hand. The spell itself is not yet in the
// cemetery and cannot be among the four (rulings, CR 5.7, 10.6.2.8).
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        const cemetery = fx.game.cards(fx.controller, "cemetery");
        if (cemetery.length >= 4 && (yield* fx.confirm())) {
          yield* fx.banish(yield* fx.chooseCards(cemetery, 4, 4));
          yield* fx.returnToHand([fx.self]);
        }
      },
    }),
  ],
});
