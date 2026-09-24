// BP02-004 Elf Girl Liza — Forestcraft follower, 2, 2/3.
// While this card is on your field, your followers take 1 less damage from enemy abilities.
// (A replacement effect, CR 5.14.2; "ability damage" is all damage except attacks, 5.14.3.3.
// Two Lizas reduce it by 2; each damage instance of a multi-target ability is reduced — rulings.)
import { defineCard } from "../helpers";

export default defineCard({
  field: {
    damageToFollower(g, self, d) {
      const me = g.controller(self);
      const enemyAbility = d.kind === "ability" && d.controller !== null && d.controller !== me;
      return enemyAbility && g.controller(d.target) === me ? -1 : 0;
    },
  },
});
