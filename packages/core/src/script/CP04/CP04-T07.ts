// CP04-T07 Mirage Wand — Runecraft equipment token, 2. プリコネ・七冠.
// The equipped follower has "If this or a Mirror Image Neneka on your field would deal ability damage, it deals that much +1
// instead." (A passive the follower has: not after it lost its abilities; two followers with it give +2 — rulings.)
// (Place this beneath the equipped follower.)
import { defineCard } from "../helpers";

export default defineCard({
  field: {
    damageBy: (g, self, d) => {
      if (d.kind !== "ability" || d.source === null || !g.equipmentGiftActive(self)) return 0;
      const follower = g.equippedFollower(self)!;
      if (d.source === follower) return 1;
      const src = g.card(d.source);
      const neneka = src?.zone === "field" && src.controller === g.controller(follower) && g.info(d.source).names.includes("Mirror Image Neneka");
      return neneka ? 1 : 0;
    },
  },
});
