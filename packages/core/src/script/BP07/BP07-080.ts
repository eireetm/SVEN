// BP07-080 Robozombie — Abysscraft follower, 4, 2/5. 機械・死者.
// Assail. Bane.
// While there's another Machina follower on your field, this follower has Rush. (A passive ability:
// it gains and loses Rush as that changes — ruling.)
import { defineCard } from "../helpers";

export default defineCard({
  keywords: ["assail", "bane"],
  field: {
    // keywordsFor: typeAndTraits (not info) for the other cards.
    keywordsFor: (g, self, card) => {
      if (card !== self) return [];
      const other = g.cards(g.card(self)!.controller, "field").some((id) => {
        if (id === self) return false;
        const k = g.typeAndTraits(id);
        return k.type === "follower" && k.traits.includes("機械");
      });
      return other ? ["rush"] : [];
    },
  },
});
