// BP17-051 Convenant Mage — Runecraft follower, 4, 1/3. 魔法使い.
// This costs X less to play. X equals the number of cards in your banished zone.
// ----------
// {[fanfare]} Draw a card. Banish a card from your hand.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  playCost: (g, _self, p) => -g.cards(p, "banished").length,
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.banish(yield* fx.chooseCards(fx.game.cards(fx.controller, "hand"), 1, 1));
      },
    }),
  ],
});
