// BP02-053 Imperial Dragoon (Evolved) — 7/7.
// On Evolve: Draw 3 cards.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.draw(3);
      },
    }),
  ],
});
