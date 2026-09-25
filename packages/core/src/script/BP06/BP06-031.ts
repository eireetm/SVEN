// BP06-031 Adept Thief — Swordcraft follower, 2, 3/2. 盗賊.
// {[fanfare]} Choose one of the following. (1) Each opponent buries the top card of their deck.
// (2) Draw a card. Discard a card.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "mill",
          label: "Each opponent buries the top card of their deck",
          *resolve(fx) {
            yield* fx.mill(1, fx.game.opponent(fx.controller));
          },
        },
        {
          id: "loot",
          label: "Draw a card, then discard a card",
          *resolve(fx) {
            yield* fx.draw(1);
            yield* fx.discard(fx.controller, 1, 1);
          },
        },
      ],
    }),
  ],
});
