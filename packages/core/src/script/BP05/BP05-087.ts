// BP05-087 Marwynn, Omen of Repose (Evolved) — Havencraft follower, 8/8. 絶傑・狂信.
// Ward. Aura.
// On Evolve: Increase your maximum play points by 1. Give your leader {[defense]}+3. Draw a card.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["ward", "aura"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.increaseMaxPlayPoints(1);
        yield* fx.giveLeaderDefense(fx.controller, 3);
        yield* fx.draw(1);
      },
    }),
  ],
});
