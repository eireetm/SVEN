// BP18-106 Deliverer of Punishment (Evolved) — 2/2.
// On Evolve - Give your leader {[defense]}+1.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
