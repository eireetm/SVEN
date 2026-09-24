// BP03-054 Witch's Cauldron — Runecraft amulet, 1. 魔法使い・土の印.
// Stack.
// {[fanfare]} Look at the top 4. You may reveal a card with Earth Rite and add it to your hand.
// Put the rest on the bottom.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["stack"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(4);
        const matching = top.filter((id) => fx.game.hasEarthRite(id));
        const [chosen] = yield* fx.selectCards(matching, 0, 1, fx.controller, top);
        if (chosen) {
          yield* fx.reveal([chosen]);
          yield* fx.returnToHand([chosen]);
        }
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
