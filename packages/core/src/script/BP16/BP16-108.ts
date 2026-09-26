// BP16-108 Holy Shieldmaiden — Havencraft follower, 5, 4/6. 信仰.
// Ward.
// During your turn, this doesn't take damage. ("-2/-2" isn't damage — ruling.)
import { defineCard } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  field: { damageTaken: (g, self, damage) => (g.activePlayer === g.controller(self) ? -damage.amount : 0) },
});
