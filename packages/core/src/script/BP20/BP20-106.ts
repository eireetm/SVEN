// BP20-106 Knight of the Holy Order (Evolved) — 3/3.
// Ward.
// On Evolve - Give your leader {[defense]}+1. Draw a card.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
        yield* fx.draw(1);
      },
    }),
  ],
});
