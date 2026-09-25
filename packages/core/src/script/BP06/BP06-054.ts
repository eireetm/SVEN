// BP06-054 Garyu, Supreme Dragonkin — Dragoncraft follower, 5, 3/4. 挑戦者・ドラゴニュート.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Draw a card.
// While this card is on your field, each other {[dragoncraft]} follower on your field has Ward.
// (A follower entering then may be put onto the field engaged for Ward — ruling, CR 12.8.2.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  field: {
    // "each other {[dragoncraft]} follower on your field has Ward" (keywordsFor: game.card / db only).
    keywordsFor: (g, self, card) => {
      const c = g.card(card);
      if (card === self || c?.zone !== "field" || c.controller !== g.card(self)?.controller) return [];
      const d = g.db.get(c.def);
      return d.type === "follower" && d.class === "Dragoncraft" ? ["ward"] : [];
    },
  },
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
