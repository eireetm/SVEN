// BP06-096 Manifest Devotion — Havencraft spell, 5. 信仰.
// Look at the top 7 cards of your deck. You may summon up to 1 amulet that costs 5 or less and up to
// 1 amulet that costs 3 or less from among them. Put the rest on the bottom of your deck in any
// order. (元のコスト: printed costs. They enter together — ruling.)
import type { CardId } from "../../model/ids";
import { defineCard, spell } from "../helpers";
import { and, costAtMost, isAmulet } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const top = fx.topCards(7);
        const chosen: CardId[] = [];
        for (const max of [5, 3]) {
          const fits = top.filter((id) => !chosen.includes(id) && and(isAmulet, costAtMost(max))(fx.game, id));
          chosen.push(...(yield* fx.selectCards(fits, 0, 1, fx.controller, top)));
        }
        yield* fx.putOntoField(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
