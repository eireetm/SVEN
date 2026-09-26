// BP17-097 Marlone, Peace Advocate (Evolved) — 3/3.
// On Evolve - Summon an Eschamali Constable token.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Eschamali Constable"]);
      },
    }),
  ],
});
