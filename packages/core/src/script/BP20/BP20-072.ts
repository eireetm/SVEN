// BP20-072 Ocean Rider — Dragoncraft follower, 3, 2/2. 海洋.
// Each Megalorca on your field has Ward.
// {[fanfare]} Summon a Megalorca token. If Overflow is active for you, summon 3 instead.
import { defineCard, fanfare } from "../helpers";
import { MEGALORCA } from "./shared";

export default defineCard({
  field: {
    // keywordsFor: namesOf (not info) for the other cards.
    keywordsFor: (g, self, card) => {
      const c = g.card(card);
      if (c?.zone !== "field" || c.controller !== g.card(self)!.controller) return [];
      return g.namesOf(card).includes(MEGALORCA) ? ["ward"] : [];
    },
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(fx.game.overflow(fx.controller) ? [MEGALORCA, MEGALORCA, MEGALORCA] : [MEGALORCA]);
      },
    }),
  ],
});
