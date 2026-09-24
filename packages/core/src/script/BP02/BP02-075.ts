// BP02-075 Azazel (Evolved) — 7/7.
// Bane.
// On Evolve: Change each enemy leader's {[defense]} to 10. (CR 5.27.2; also raises it when it was
// lower — ruling.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.setLeaderDefense(fx.game.opponent(fx.controller), 10);
      },
    }),
  ],
});
