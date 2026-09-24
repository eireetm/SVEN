// BP02-087 Bone Chimera — Abysscraft follower, 3, 1/1.
// Necrocharge (7): This follower has Rush and Bane. (A passive, lost as soon as the cemetery has
// fewer than 7 cards — ruling; CR 13.5.1, 10.9.1.2.)
// {[fanfare]} Put the top 3 cards of your deck into your cemetery.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  field: {
    keywordsFor: (g, self, card) => (card === self && g.necrocharge(g.card(self)!.controller, 7) ? ["rush", "bane"] : []),
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.mill(3);
      },
    }),
  ],
});
