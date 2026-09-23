// BP01-085 Dragonewt Scholar — Dragoncraft follower, 2, 2/2.
// Intimidate. // Strike: Draw a card, then discard a card.
import { defineCard, strike } from "../helpers";

export default defineCard({
  keywords: ["intimidate"],
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
