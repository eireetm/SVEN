// BP04-016 Fita the Gentle Elf (Evolved) — Forestcraft, 3/2.
// On Evolve: Give your leader +1 defense. Draw a card.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
        yield* fx.draw(1);
      },
    }),
  ],
});
