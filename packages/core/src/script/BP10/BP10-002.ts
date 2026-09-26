// BP10-002 XII. Wolfraud, Hanged Man (Evolved) — Forestcraft follower, 3/3. アルカナ・精霊.
// This card can't be destroyed by abilities or take ability damage.
// On Evolve, Combo (3) - Give this follower {[attack]}+1/{[defense]}+1. (Evolving is not playing a
// card, so it doesn't count for Combo — ruling.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  cannotBeDestroyedByAbilities: true,
  field: { damageTaken: (_g, _self, damage) => (damage.kind === "ability" ? -damage.amount : 0) },
  abilities: [
    onEvolve({
      condition: (g, p) => g.combo(p, 3),
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
