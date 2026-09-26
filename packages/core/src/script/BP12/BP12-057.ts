// BP12-057 Giselle, Mermaid Healer — Dragoncraft follower, 1, 1/1. 海洋.
// While Overflow is active for you, each other Marine follower on your field has Rush and Assail. (A
// passive: it follows Overflow — ruling.)
// {[fanfare]} Give your leader {[defense]}+2.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  field: {
    // Part of computing keywords: types and traits via typeAndTraits, not info (it would recurse).
    keywordsFor: (g, self, card) => {
      const p = g.controller(self);
      if (card === self || g.card(card)?.zone !== "field" || g.controller(card) !== p || !g.overflow(p)) return [];
      const { type, traits } = g.typeAndTraits(card);
      return type === "follower" && traits.includes("海洋") ? ["rush", "assail"] : [];
    },
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
