// BP01-087 Shenlong (Evolved) — 5/6.
// Ward. // On Evolve: Give your leader +5 defense.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 5);
      },
    }),
  ],
});
