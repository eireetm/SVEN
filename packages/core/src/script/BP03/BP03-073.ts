// BP03-073 Dark Alice — Abysscraft follower, 6, 6/6. 魔界・童話.
// Rush.
// Strike: The opponent discards a card.
// {[lastwords]} Banish the top 10 cards of your deck: Put this follower onto its owner's field.
// Discard a card. The banish is an optional cost (CR 10.4.7.4). Declining skips the discard too
// (ruling). An empty hand still reanimates; the discard then does nothing (ruling).
import { defineCard, lastWords, strike } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.discard(fx.game.opponent(fx.controller), 1, 1);
      },
    }),
    lastWords({
      cost: {
        canPay: (g, c) => g.cards(c, "deck").length >= 10,
        *pay(fx) {
          yield* fx.banish(fx.topCards(10));
        },
      },
      *resolve(fx) {
        const owner = fx.game.card(fx.self)?.owner ?? fx.controller;
        yield* fx.putOntoField([fx.self], owner);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
