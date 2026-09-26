// BP10-092 VIII. Sofina, Strength — Havencraft follower, 4, 2/5. アルカナ・先導.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
// If a follower on your field would take more than 3 damage, it takes 3 instead. (Each damage, also
// Sofina itself; ordered with other changes by the affected player, CR 10.10.2 — rulings.)
import { defineCard, evolveAbility } from "../helpers";
import { sofinaCap } from "./shared";

export default defineCard({
  keywords: ["ward"],
  field: { damageToFollower: sofinaCap },
  abilities: [evolveAbility(1)],
});
