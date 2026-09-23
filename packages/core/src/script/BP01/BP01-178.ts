// BP01-178 Healing Angel (Evolved) — 3/5.
// On Evolve: Give your leader +2 defense.
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
