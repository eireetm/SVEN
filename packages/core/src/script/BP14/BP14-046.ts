// BP14-046 Dream Come True — Runecraft spell, 7. 魔法生物.
// Put the top card of your deck into your EX area. Repeat until your EX area is full. This turn, the next card
// you play that was put into your EX area this way costs 0. (It must go on until the EX area is full; an empty
// deck just stops it — rulings. CR 10.4.4.1.)
import type { CardId } from "../../model/ids";
import { defineCard, spell } from "../helpers";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const g = fx.game;
        const put: CardId[] = [];
        while (g.cards(fx.controller, "ex").length < g.exAreaLimit(fx.controller) && g.cards(fx.controller, "deck").length > 0) {
          const moved = yield* fx.topToEx(1);
          if (moved.length === 0) break;
          put.push(...moved);
        }
        // One use shared by these cards (the group is this play of the spell).
        for (const id of put) yield* fx.setPlayCost(id, 0, "endOfTurn", fx.self);
      },
    }),
  ],
});
