// CSD02c-008 Miria Akagi (Evolved) — 3/3.
// On Evolve - Discard a Passion card: Draw 2 cards.
import { discardA } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { passion } from "../CP02/shared";

export default defineCard({
  abilities: [
    onEvolve({
      cost: discardA(passion),
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
  ],
});
