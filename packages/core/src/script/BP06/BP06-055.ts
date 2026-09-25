// BP06-055 Garyu, Supreme Dragonkin (Evolved) — Dragoncraft follower, 4/5. 挑戦者・ドラゴニュート.
// On Evolve - You may summon a {[dragoncraft]} follower that costs 5 or less from your hand.
// While this card is on your field, each other {[dragoncraft]} follower on your field has Ward.
import { defineCard, onEvolve } from "../helpers";
import { and, costAtMost, isClass, isFollower } from "../targets";

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
    onEvolve({
      *resolve(fx) {
        const hand = fx.game.cards(fx.controller, "hand").filter((id) => and(isFollower, isClass("Dragoncraft"), costAtMost(5))(fx.game, id));
        yield* fx.putOntoField(yield* fx.selectCards(hand, 0, 1));
      },
    }),
  ],
});
