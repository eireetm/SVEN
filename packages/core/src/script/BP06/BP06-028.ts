// BP06-028 Grand Acquisition — Swordcraft spell, 1. 盗賊.
// Quick.
// Each opponent buries the top 3 cards of their deck.
import { defineCard, spell } from "../helpers";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.mill(3, fx.game.opponent(fx.controller));
      },
    }),
  ],
});
