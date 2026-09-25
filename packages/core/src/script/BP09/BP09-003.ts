// BP09-003 White Vanara (Evolved) — Forestcraft follower, 3/3. 精霊・獣.
// While this follower's attack is at least 4, it has Ward. While at least 7, it has Storm. While at
// least 10, it ignores Ward. (Passive: gained and lost as its attack changes; losing "ignores Ward"
// during an attack doesn't change the attack target — rulings.)
// Strike - Select an enemy follower on the field and deal it damage equal to this follower's attack.
import type { Keyword } from "../../model/keyword";
import { defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";
import { damageEqualToAttack } from "./shared";

export default defineCard({
  field: {
    keywordsFor: (g, self, card) => {
      if (card !== self) return [];
      const attack = g.statsOf(self).attack ?? 0;
      const out: Keyword[] = [];
      if (attack >= 4) out.push("ward");
      if (attack >= 7) out.push("storm");
      return out;
    },
  },
  ignoresWard: (g, self) => (g.statsOf(self).attack ?? 0) >= 10,
  abilities: [strike({ targets: [enemyFollower()], resolve: damageEqualToAttack })],
});
