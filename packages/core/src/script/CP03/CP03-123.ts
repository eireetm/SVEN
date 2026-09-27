// CP03-123 Luck Bird — Havencraft spell, 1. ヴァンガード・オラクルシンクタンク.
// Choose one. (1) Look at the top 3 cards of your deck. Put any number of them on the top of your deck in any order. Put the rest
// on the bottom in any order. (2) Select 5 followers with Triggers in your cemetery. Return them to your deck, shuffle, draw a
// card, and recover 1 play point. ((2) can't be chosen without 5 of them — ruling, CR 10.6.2.3.3.)
import { defineCard, spell } from "../helpers";
import { inYourZone, isFollower } from "../targets";
import { arrangeTop } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "1",
          label: "Arrange the top 3 cards of your deck",
          *resolve(fx) {
            yield* arrangeTop(fx, 3);
          },
        },
        {
          id: "2",
          label: "Return 5 followers with Triggers from your cemetery to your deck, draw a card and recover 1 play point",
          targets: [inYourZone("cemetery", { count: 5, filter: (g, id) => isFollower(g, id) && g.db.get(g.card(id)!.def).trigger !== undefined })],
          *resolve(fx) {
            yield* fx.putOnDeck(fx.targets[0]!, "top");
            yield* fx.shuffleDeck();
            yield* fx.draw(1);
            yield* fx.recoverPlayPoints(1);
          },
        },
      ],
    }),
  ],
});
