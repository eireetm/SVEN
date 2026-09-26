// BP17-082 Amy, Psychopomp Guide (Evolved) — 2/2.
// On Evolve - Give your leader {[defense]}+2
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
