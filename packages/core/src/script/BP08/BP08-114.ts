// BP08-114 Steelclad Minotaur — Neutral follower, 6, 7/6. 傭兵・獣.
// Rush. Ward. It takes 2 less combat damage (combat means follower-to-follower fight damage,
// ruling; CR 5.14.3.2, 10.10.2).
import { defineCard } from "../helpers";

export default defineCard({
  keywords: ["rush", "ward"],
  field: { damageTaken: (_g, _self, damage) => (damage.combat ? -2 : 0) },
});
