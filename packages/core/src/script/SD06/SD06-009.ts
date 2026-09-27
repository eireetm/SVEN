// SD06-009 Ardent Nun — Havencraft follower, 2, 2/2. 信仰.
// {[evolve]} {[cost01]}: Evolve this follower.
// Ward.
// During each opponent's turn, this follower deals 1 more damage. (CR 5.14.2, like BP01-137.)
import { defineCard, evolveAbility } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  field: { damageDealt: (g, self) => (g.activePlayer !== g.controller(self) ? 1 : 0) },
  abilities: [evolveAbility(1)],
});
