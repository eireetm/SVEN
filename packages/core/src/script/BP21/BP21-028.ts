// BP21-028 Tony, Plucky Polliwog (Evolved) — 2/3.
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
