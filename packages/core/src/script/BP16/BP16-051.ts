// BP16-051 Starry-Eyed Penguin Wizard (Evolved) — Runecraft follower, 3/3. 魔法使い・獣・魔法生物.
// On Evolve - Draw 2 cards. Discard 2 cards.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.draw(2);
        yield* fx.discard(fx.controller, 2, 2);
      },
    }),
  ],
});
