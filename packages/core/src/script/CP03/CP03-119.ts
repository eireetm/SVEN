// CP03-119 Dream Eater — Havencraft follower, 2, 2/3. ヴァンガード・オラクルシンクタンク. Draw Trigger.
// {[fanfare]} Draw a card. Put a card from your hand into your deck 3rd from the top.
// ----------
// (If this card is revealed by a drive check, draw a card.) (Resolved by the engine.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        const hand = fx.game.cards(fx.controller, "hand");
        const [card] = yield* fx.chooseCards(hand, Math.min(1, hand.length), 1);
        if (card !== undefined) yield* fx.putIntoDeckAt(card, 3);
      },
    }),
  ],
});
