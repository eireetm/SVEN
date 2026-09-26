// BP20-049 Illusory Conjuration — Runecraft spell, 1. 絶傑・魔法使い.
// Look at the top 3 cards of your deck. You may reveal a card with Omen and Mage traits from among them and add it to your
// hand or put it into your EX area. Put the rest on the bottom of your deck in any order. (CR 5.11, 5.21; the EX area only
// with room, 4.8.3.2.)
import { defineCard, spell } from "../helpers";
import { omenMage } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const top = fx.topCards(3);
        const [card] = yield* fx.selectCards(top.filter((id) => omenMage(fx.game, id)), 0, 1, fx.controller, top);
        if (card !== undefined) {
          yield* fx.reveal([card]);
          const room = fx.game.cards(fx.controller, "ex").length < fx.game.exAreaLimit(fx.controller);
          const [where] = room
            ? yield* fx.choose([
                { id: "hand", label: "Add it to your hand" },
                { id: "ex", label: "Put it into your EX area" },
              ])
            : ["hand"];
          if (where === "ex") yield* fx.putIntoEx([card]);
          else yield* fx.returnToHand([card]);
        }
        yield* fx.bottomInAnyOrder(top.filter((id) => fx.game.card(id)?.zone === "deck"));
      },
    }),
  ],
});
