// BP14-113 Gunslinger Automaton (Evolved) — Neutral follower, 3/3. 傭兵・超克.
// On Evolve - Summon an Ancient Artifact token.
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
