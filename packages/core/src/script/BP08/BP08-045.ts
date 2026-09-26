// BP08-045 Veridic Discovery — Runecraft spell, 2. 錬金術師.
// {[quick]}
// Draw 2 cards. Discard a card.
import { defineCard, spell } from "../helpers";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.draw(2);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
