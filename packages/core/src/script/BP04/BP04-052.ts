// BP04-052 Dazzling Healer (Evolved) — Runecraft, 3/3.
// On Evolve: Spellchain (5): Give your leader +2 defense.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        if (fx.game.spellchain(fx.controller, 5)) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
