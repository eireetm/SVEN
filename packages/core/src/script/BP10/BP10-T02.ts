// BP10-T02 Devoted Dragon — Dragoncraft token follower, 5, 6/6. 竜族.
// Ward.
// While there's an Aiela, Devoted Knight on your field, this follower doesn't take ability damage.
// (Ability damage: all but combat damage and attack damage to a leader — ruling, CR 5.14.3.)
import { defineCard } from "../helpers";
import { onYourField } from "./shared";

export default defineCard({
  keywords: ["ward"],
  field: {
    damageTaken: (g, self, damage) =>
      damage.kind === "ability" && onYourField(g, g.controller(self), "Aiela, Devoted Knight") ? -damage.amount : 0,
  },
});
