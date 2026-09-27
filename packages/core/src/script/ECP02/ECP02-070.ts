// ECP02-070 Natalia [One Thousand and One Nights] — Havencraft follower, 2, 2/2. デレマス・パッション.
// Rush.
// While there are at least 5 Passion cards in your cemetery, this has Assail and Bane. (A passive ability — ruling.)
// {[fanfare]} Discard a Passion card: Draw a card.
import { discardA } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { passion } from "./shared";

export default defineCard({
  keywords: ["rush"],
  field: {
    // typeAndTraits (not info) inside the keyword passive.
    keywordsFor: (g, self, card) => {
      if (card !== self) return [];
      const n = g.cards(g.controller(self), "cemetery").filter((id) => g.typeAndTraits(id).traits.includes("パッション")).length;
      return n >= 5 ? ["assail", "bane"] : [];
    },
  },
  abilities: [
    fanfare({
      cost: discardA(passion),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
