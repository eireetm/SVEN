// BP17-086 Rouge Vampire (Evolved) — 4/4.
// On Evolve - If Sanguine is active for you, give this Drain. (Sanguine, CR 13.5.2.2; checked as it resolves.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        if (fx.game.sanguine(fx.controller) && fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "drain");
      },
    }),
  ],
});
