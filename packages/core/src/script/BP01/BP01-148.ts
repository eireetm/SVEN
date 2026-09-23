// BP01-148 Hallowed Dogma — Havencraft spell, 1. {[quick]}
// Look at the top 5 cards of your deck. You may reveal an amulet from among them and add it to
// your hand. Put the remaining cards on the bottom of your deck in any order.
import { defineCard, spell } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        const top = fx.topCards(5);
        const amulets = top.filter((id) => isAmulet(fx.game, id));
        const chosen = yield* fx.selectCards(amulets, 0, 1, fx.controller, top);
        yield* fx.reveal(chosen);
        yield* fx.returnToHand(chosen);
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
