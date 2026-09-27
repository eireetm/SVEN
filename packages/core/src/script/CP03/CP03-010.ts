// CP03-010 Tear Knight, Lazarus — Forestcraft follower, 2, 3/2. ヴァンガード・アクアフォース.
// This follower doesn't take damage from enemy abilities. (Ability damage: any damage but combat and attack damage — ruling;
// CR 5.14.3.)
import { defineCard } from "../helpers";

export default defineCard({
  field: {
    damageTaken: (g, self, damage) =>
      damage.kind === "ability" && damage.controller !== null && damage.controller !== g.controller(self) ? -damage.amount : 0,
  },
});
