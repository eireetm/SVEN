// BP18-041 Françoise, Bejeweled Manager — Runecraft follower, 1, 1/1. 透京・錬金術師・商人.
// {[fanfare]} Draw a card. Banish a card from your hand.
// Activate {[engage]} this: Select an enemy leader or enemy follower on the field and deal it 2 damage. Activate only if
// there are at least 10 cards in your banished zone.
// {[lastwords]} Banish this. (The card in the cemetery.)
import { activated, defineCard, fanfare, lastWords } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";
import { banishedCount } from "./shared";
import { banishFromHand } from "./shared-rune";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* banishFromHand(fx, 1);
      },
    }),
    activated(
      { engageSelf: true },
      {
        condition: (g, c) => banishedCount(g, c) >= 10,
        targets: [enemyLeaderOrFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
    ),
    lastWords({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.banish([fx.self]);
      },
    }),
  ],
});
