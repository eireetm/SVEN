// CP02-101 Sanae Katagiri — Havencraft follower, 7, 7/7. デレマス・パッション.
// Rush. Ward.
// If this follower would take more than 3 damage, it takes 3 instead. (Each damage separately, not a total per turn — ruling;
// a replacement effect, CR 10.10.1.)
import { defineCard } from "../helpers";

export default defineCard({
  keywords: ["rush", "ward"],
  field: {
    damageTaken: (_g, _self, damage) => (damage.amount > 3 ? 3 - damage.amount : 0),
  },
});
