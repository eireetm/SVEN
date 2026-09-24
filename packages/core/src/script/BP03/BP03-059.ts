// BP03-059 Red Ragewyrm — Dragoncraft follower, 3, 0/5. 竜族・童話.
// Activate {[engage]}: +5 attack, or +10 if Overflow is active for you (CR 13.4).
import { activated, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          yield* fx.giveStats(fx.self, fx.game.overflow(fx.controller) ? 10 : 5, 0);
        },
      },
    ),
  ],
});
