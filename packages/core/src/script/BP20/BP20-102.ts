// BP20-102 Supplicant of Repose (Evolved) — 3/3.
// On Evolve - Put a Crest: Supplicant of Repose token in your EX area.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["Crest: Supplicant of Repose"]);
      },
    }),
  ],
});
