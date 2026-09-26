// BP14-T07 Mercurial Might — Havencraft spell token, 1. 信仰・超克.
// {[quick]}
// If your leader would take damage this turn, it takes that much minus 1 instead. Draw a card. (Two of them give
// -2; "-X defense" isn't damage — rulings. CR 5.14.2.)
import { defineCard, spell } from "../helpers";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.reduceDamage(fx.game.leader(fx.controller), 1, "endOfTurn");
        yield* fx.draw(1);
      },
    }),
  ],
});
