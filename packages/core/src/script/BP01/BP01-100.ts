// BP01-100 Dragon Emissary — Dragoncraft spell, 1.
// Look at the top 5 cards of your deck. You may reveal a {[dragoncraft]} card that costs at
// least 5 play points from among them and add it to your hand. Put the remaining cards on the
// bottom of your deck in any order. ("may" — ruling.)
import { defineCard, spell } from "../helpers";
import { and, costAtLeast, isClass } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const top = fx.topCards(5);
        const eligible = top.filter((id) => and(isClass("Dragoncraft"), costAtLeast(5))(fx.game, id));
        const chosen = yield* fx.selectCards(eligible, 0, 1, fx.controller, top);
        yield* fx.reveal(chosen);
        yield* fx.returnToHand(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
