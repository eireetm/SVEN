// BP19-067 Seasoned Merman — Dragoncraft follower, 3, 3/3. 海洋.
// Each Megalorca on your field has Rush and Assail. (An attack already declared goes on if they're lost — ruling.)
// {[fanfare]} Summon 2 Megalorca tokens. Put the top card of your deck into your EX area.
import { defineCard, fanfare } from "../helpers";
import { MEGALORCA } from "./shared";

export default defineCard({
  field: {
    // keywordsFor: namesOf (not info) for the other cards.
    keywordsFor: (g, self, card) => {
      const c = g.card(card);
      if (card === self || c?.zone !== "field" || c.controller !== g.card(self)!.controller) return [];
      return g.namesOf(card).includes(MEGALORCA) ? ["rush", "assail"] : [];
    },
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([MEGALORCA, MEGALORCA]);
        yield* fx.topToEx(1);
      },
    }),
  ],
});
