// BP02-097 Radiance Angel (Evolved) — 4/5.
// Ward. // On Evolve: Give your leader {[defense]}+2.
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
