// BP07-096 Marcotte, Heretical Sister — Havencraft follower, 2, 1/3. 狂信.
// Ward.
// {[fanfare]} Draw a card. If there are 5 cards in your EX area, instead search your deck for any
// card, add it to your hand, then shuffle your deck. (Not revealed: its only condition is the number
// — ruling, CR 5.8.1.2.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.cards(fx.controller, "ex").length === 5) yield* fx.search(() => true, { reveal: false });
        else yield* fx.draw(1);
      },
    }),
  ],
});
