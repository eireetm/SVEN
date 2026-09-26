// BP11-013 Lookout Elf (Evolved) — Forestcraft follower, 4/4. エルフ族.
// On Evolve - Summon 2 Fairy tokens.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Fairy", "Fairy"]);
      },
    }),
  ],
});
