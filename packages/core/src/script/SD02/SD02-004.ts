// SD02-004 Floral Fencer (Evolved) — 4/4.
// On Evolve: Summon a Steelclad Knight and Knight token. (With room for one, its player picks which — ruling, CR 4.4.4.2.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Steelclad Knight", "Knight"]);
      },
    }),
  ],
});
