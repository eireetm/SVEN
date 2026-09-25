// BP06-085 Zashiki-Warashi (Evolved) — Abysscraft follower, 3/3. 妖怪.
// On Evolve - Discard a Yokai card: Give your leader {[defense]}+1. Draw 2 cards.
import { defineCard, onEvolve } from "../helpers";
import { discardA } from "../costs";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      cost: discardA(hasTrait("妖怪")),
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
        yield* fx.draw(2);
      },
    }),
  ],
});
