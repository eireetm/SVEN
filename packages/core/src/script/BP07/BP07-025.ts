// BP07-025 Troya, Thunder of Hagelberg — Swordcraft follower, 3, 2/2. 兵士・暗殺者.
// {[evolve]} {[cost01]}: Evolve this follower.
// Bane.
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  keywords: ["bane"],
  abilities: [evolveAbility(1)],
});
