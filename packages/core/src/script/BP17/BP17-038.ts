// BP17-038 Isabelle, Intrepid Mage (Evolved) — Runecraft follower, 4/4. 魔法使い.
// On Evolve - Put a Quadra Magic token into your EX area.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["Quadra Magic"]);
      },
    }),
  ],
});
