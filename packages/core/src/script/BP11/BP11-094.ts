// BP11-094 Set (Evolved) — Havencraft follower, 3/7. 信仰・獣.
// Ward. Bane. Aura.
// On Evolve - Give your leader {[defense]}+4
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["ward", "bane", "aura"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 4);
      },
    }),
  ],
});
