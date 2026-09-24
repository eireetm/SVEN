// BP04-011 Sukuna, Brave and Small (Evolved) — Forestcraft, 2/2.
// Storm.
// On Evolve: Combo (3): +1/+1. Combo (5): +3/+3 instead. (Evolving is not playing a card —
// ruling.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        if (fx.game.combo(fx.controller, 5)) yield* fx.giveStats(fx.self, 3, 3);
        else if (fx.game.combo(fx.controller, 3)) yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
