// BP12-077 Liberté, Werewolf Pup (Evolved) — Abysscraft follower, 2/2. 獣.
// On Evolve - If Sanguine is active for you, give your leader {[defense]}+2 and draw a card. (Without
// Sanguine, no draw either — ruling.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      condition: (g, p) => g.sanguine(p),
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
        yield* fx.draw(1);
      },
    }),
  ],
});
