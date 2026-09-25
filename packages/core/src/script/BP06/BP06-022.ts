// BP06-022 Hero of Antiquity — Swordcraft follower, 7, 6/10. 兵士.
// {[evolve]} {[cost01]}: Evolve this follower.
// Rush. Aura.
// This card can't be destroyed or banished by abilities. (It can still be destroyed by ability
// damage; "put into the cemetery" is not destroying — rulings.)
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  keywords: ["rush", "aura"],
  cannotBeDestroyedByAbilities: true,
  cannotBeBanishedByAbilities: true,
  abilities: [evolveAbility(1)],
});
