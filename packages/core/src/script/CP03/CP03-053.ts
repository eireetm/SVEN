// CP03-053 Nitro Juggler — Runecraft follower, 3, 4/4. ヴァンガード・ペイルムーン.
// While there are at least 5 cards in your banished zone, this follower has Bane and Ward. (A passive ability — ruling.)
// {[fanfare]} Look at the top 5 cards of your deck. You may banish up to 2 of them. Put the rest on the bottom of your deck in
// any order.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  field: {
    keywordsFor: (g, self, card) => (card === self && g.cards(g.controller(self), "banished").length >= 5 ? ["bane", "ward"] : []),
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(5);
        const chosen = yield* fx.selectCards(top, 0, 2, fx.controller, top);
        yield* fx.banish(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => !chosen.includes(id)));
      },
    }),
  ],
});
