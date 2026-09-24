// BP05-115 Cat Cannoneer (Evolved) — Neutral follower, 4/4. 傭兵・超克.
// On Evolve: Summon an Ancient Artifact token.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Ancient Artifact"]);
      },
    }),
  ],
});
