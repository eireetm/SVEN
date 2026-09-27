// ECP02-009 Hinako Kita [True Dream] (Evolved) — 2/2.
// On Evolve - Draw a card. Give your leader {[defense]}+2.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
