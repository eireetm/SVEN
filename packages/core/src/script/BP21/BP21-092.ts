// BP21-092 Verdilia, Rogue Professor (Evolved) — 2/2.
// Ward.
// On Evolve - Give your leader {[defense]}+1. Draw a card.
// On Super-Evolve - Put a Cyclical Guidance token into your EX area.
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
        yield* fx.draw(1);
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["Cyclical Guidance"]);
      },
    }),
  ],
});
