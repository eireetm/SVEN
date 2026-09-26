// BP18-102 Conferrer of Vows (Evolved) — 4/4.
// On Evolve - Give your leader {[defense]}+2.
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
