// SD04-013 Dragonrider (Evolved) — 3/3.
// On Evolve: If Overflow is active for you, give this follower {[attack]}+2.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* fx.giveStats(fx.self, 2, 0);
      },
    }),
  ],
});
