// BP15-120 Mechanical Analyzer (Evolved) — Neutral follower, 4/4. 超克.
// On Evolve - Draw 2 cards.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
  ],
});
