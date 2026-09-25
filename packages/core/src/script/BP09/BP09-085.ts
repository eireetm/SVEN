// BP09-085 Poltergeist — Abysscraft spell, 1. 死者. Quick.
// Bury the top 2 cards of your deck.
import { defineCard, spell } from "../helpers";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.mill(2);
      },
    }),
  ],
});
