// BP02-089 Heavenly Aegis — Havencraft follower, 8, 8/8.
// {[evolve]}{[cost02]}: Evolve this follower.
// {[evolve]} Discard 3 cards: Evolve this follower. (Either evolve ability can be used — ruling.)
// Aura.
// This card can't be destroyed by abilities. (It can still be destroyed by ability damage.)
// (CR 1.3.3: it can still be selected, the rest of the effect happens — rulings; banishing works.)
import { defineCard, evolveAbility } from "../helpers";
import { discardCardsCost } from "../costs";

export default defineCard({
  keywords: ["aura"],
  cannotBeDestroyedByAbilities: true,
  abilities: [evolveAbility(2), evolveAbility({ custom: discardCardsCost(3) })],
});
