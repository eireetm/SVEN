// BP02-047 Craig, Wizard of Mysteria (Evolved) — 3/2.
// On Evolve: Draw a card, then discard a card.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
