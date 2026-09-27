// SD03-011 Sammy, Wizard's Apprentice (Evolved) — 3/2.
// On Evolve: Each player draws a card. (A player with an empty deck loses — ruling, CR 5.10.1.1.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.draw(1, fx.controller);
        yield* fx.draw(1, fx.game.opponent(fx.controller));
      },
    }),
  ],
});
