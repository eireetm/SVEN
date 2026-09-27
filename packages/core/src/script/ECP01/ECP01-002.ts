// ECP01-002 Hokko Tarumae (Evolved) — 3/3.
// On Evolve - Draw a card.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
