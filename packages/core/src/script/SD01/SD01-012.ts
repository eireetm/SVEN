// SD01-012 Water Fairy (Evolved) — 2/2.
// On Evolve: Summon a Fairy token.
// {[lastwords]} Put a Fairy token into your EX area. (Only this Last Words, not the unevolved card's — ruling.)
import { defineCard, lastWords, onEvolve } from "../helpers";
import { FAIRY } from "../BP13/shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon([FAIRY]);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.tokensToEx([FAIRY]);
      },
    }),
  ],
});
