// BP19-057 Drazael, Ravening Enforcer — Dragoncraft follower, 6, 4/5. 八獄・竜族.
// This can't be played from the EX area.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
// This can't be destroyed by abilities. (Burying it still works — ruling; CR 1.3.3.)
// {[lastwords]} Put this into its owner's EX area.
import { defineCard, evolveAbility } from "../helpers";
import { backToEx, notFromEx } from "./shared-dragon";

export default defineCard({
  keywords: ["ward"],
  playableIf: notFromEx,
  cannotBeDestroyedByAbilities: true,
  abilities: [evolveAbility(1), backToEx],
});
