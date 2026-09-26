// BP15-107 Temple Healer (Evolved) — Havencraft follower, 2/4. 信仰.
// Ward.
// On Evolve - Draw a card.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
