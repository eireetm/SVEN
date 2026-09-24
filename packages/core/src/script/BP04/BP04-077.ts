// BP04-077 Scaled Berserker — Dragoncraft follower, 6, 6/7. 竜族.
// Rush.
// Whenever this follower takes damage, give it +2/+2. (0 damage is not damage; if the damage
// destroys it, the triggered ability gives nothing — rulings.)
import { defineCard, whenThisTakesDamage } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    whenThisTakesDamage({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 2);
      },
    }),
  ],
});
