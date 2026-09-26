// BP18-075 Estrella Beast — Dragoncraft follower, 3, 3/4. 獣.
// This doesn't take ability damage. (All damage but a fight's and an attack on a leader — ruling, CR 5.14.3.3.)
import { defineCard } from "../helpers";

export default defineCard({
  field: { damageTaken: (_g, _self, damage) => (damage.kind === "ability" ? -damage.amount : 0) },
});
