// CP02-095 Haru Yuuki (Evolved) — 3/3.
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
