// SD06-012 Guardian Nun (Evolved) — 4/4.
// Ward.
// On Evolve: Give your leader {[defense]}+2. (Also above 20 — ruling.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
