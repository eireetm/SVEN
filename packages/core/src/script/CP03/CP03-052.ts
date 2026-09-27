// CP03-052 Dark Metal Bicorn — Runecraft follower, 1, 2/2. ヴァンガード・ペイルムーン.
// Activate {[engage]}: Draw a card. Banish a card from your hand.
import { activated, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          yield* fx.draw(1);
        const hand = fx.game.cards(fx.controller, "hand");
        yield* fx.banish(yield* fx.chooseCards(hand, Math.min(1, hand.length), 1));
        },
      },
    ),
  ],
});
