// CP04-T02 Princess Sword — Swordcraft equipment token, 2. プリコネ・美食殿.
// If the equipped follower would deal damage, it deals that much +2 instead.
// If the equipped follower would take damage, it takes that much -2 instead.
// (Place this beneath the equipped follower.)
// The token's own abilities (CR 14.5.2.1.2): they still apply after the follower lost its abilities; combat and ability damage;
// the player taking the damage orders them with other changes (CR 10.10.2); damage of 0 is not dealt, so not raised — rulings.
import { defineCard } from "../helpers";

export default defineCard({
  field: {
    damageBy: (g, self, d) => (d.source !== null && d.source === g.equippedFollower(self) ? 2 : 0),
    damageToFollower: (g, self, d) => (d.target === g.equippedFollower(self) ? -2 : 0),
  },
});
