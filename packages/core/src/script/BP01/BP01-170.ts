// BP01-170 Trail of Light — Neutral spell, 2.
// When this card is discarded, draw a card. // ---------- // Draw a card.
// (Also when discarded for the hand limit, which may then require discarding again; not when it
// is played — rulings.)
import { defineCard, spell, whenDiscarded } from "../helpers";

export default defineCard({
  abilities: [
    whenDiscarded({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    spell({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
