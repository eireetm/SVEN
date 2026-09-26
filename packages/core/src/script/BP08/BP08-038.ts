// BP08-038 Unbodied Witch — Runecraft follower, 8, 7/7. 魔法生物・禁忌.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Draw X cards. X equals the number of cards in your deck minus 5. (The deck when it
// resolves; a negative X draws nothing — rulings, CR 1.3.2.2.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(Math.max(0, fx.game.cards(fx.controller, "deck").length - 5));
      },
    }),
  ],
});
