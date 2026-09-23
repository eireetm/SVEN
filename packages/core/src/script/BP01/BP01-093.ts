// BP01-093 Ivory Dragon (Evolved) — 2/2.
// On Evolve: If Overflow is active for you, draw a card.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* fx.draw(1);
      },
    }),
  ],
});
