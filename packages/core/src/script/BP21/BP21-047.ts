// BP21-047 Leeds, Pining Witch — Runecraft follower, 2, 2/2. 魔法使い・学院.
// {[fanfare]} Banish the top card of your deck.
// Activate {[engage]} this, banish this: Select an enemy follower on the field. Deal it 4 damage and draw a card. Activate
// only if there are at least 5 cards in your banished zone. (Checked before the costs are paid; needs a target — rulings.)
import { banishThis } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(1);
        if (top.length > 0) yield* fx.banish(top);
      },
    }),
    activated(
      { engageSelf: true, custom: banishThis },
      {
        condition: (g, c) => g.cards(c, "banished").length >= 5,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 4);
          yield* fx.draw(1);
        },
      },
    ),
  ],
});
