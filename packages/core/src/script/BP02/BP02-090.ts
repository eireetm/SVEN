// BP02-090 Heavenly Aegis (Evolved) — 10/10.
// Aura.
// On Evolve: For the rest of this turn and during each opponent's next turn, this follower doesn't
// take damage. (CR 5.14.2 replacement; not during your own later turns.)
// This card can't be destroyed by abilities. (CR 1.3.3)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["aura"],
  cannotBeDestroyedByAbilities: true,
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.preventDamage(fx.self, "all", "endOfOpponentsNextTurn");
      },
    }),
  ],
});
