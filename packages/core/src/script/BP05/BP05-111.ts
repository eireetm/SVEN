// BP05-111 Rosa, Mech Wing Maiden (Evolved) — Neutral follower, 2/4. 天使・超克.
// Ward.
// On Evolve: Draw a card.
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
