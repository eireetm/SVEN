// CP02-081 Mirei Hayasaka — Abysscraft follower, 3, 4/3. デレマス・キュート.
// {[fanfare]} Look at the top 3 cards of your deck. Put one of them on the top of your deck. Bury the rest.
// While there are at least 5 iM@S CG cards in your cemetery, this follower has Rush. (A passive ability — ruling.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  field: {
    // keywordsFor: typeAndTraits (not info) for the other cards.
    keywordsFor: (g, self, card) => {
      if (card !== self) return [];
      const imasCards = g.cards(g.controller(self), "cemetery").filter((id) => g.typeAndTraits(id).traits.includes("デレマス"));
      return imasCards.length >= 5 ? ["rush"] : [];
    },
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(3);
        const [keep] = yield* fx.selectCards(top, 1, 1, fx.controller, top);
        yield* fx.bury(top.filter((id) => id !== keep));
      },
    }),
  ],
});
