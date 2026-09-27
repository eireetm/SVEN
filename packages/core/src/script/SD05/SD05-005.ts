// SD05-005 Midnight Vampire — Abysscraft follower, 3, 2/4. 吸血鬼.
// {[fanfare]} Summon a Forest Bat token.
// While this card is on your field, your Forest Bat tokens have Drain. (Two of these still drain once — ruling.)
import { defineCard, fanfare } from "../helpers";
import { BAT } from "./shared";

export default defineCard({
  field: {
    keywordsFor(g, self, card) {
      const c = g.card(card);
      if (!c || c.zone !== "field" || g.controller(card) !== g.controller(self)) return [];
      const def = g.db.get(c.def);
      return def.token && g.namesOf(card).includes(BAT) ? ["drain"] : [];
    },
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([BAT]);
      },
    }),
  ],
});
