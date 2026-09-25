// BP09-039_back Mysterian Blackwyrm — Runecraft follower, 5/5. 学院・キラー. The back face of BP09-039
// (CR 2.14; its Japanese text and traits are transcribed from the card, data/fixes.ts).
// Assail.
// On Evolve - Deal 3 damage to each enemy leader.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.dealDamageEach([fx.game.leader(fx.game.opponent(fx.controller))], 3);
      },
    }),
  ],
});
