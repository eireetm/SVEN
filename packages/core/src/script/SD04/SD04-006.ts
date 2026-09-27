// SD04-006 Dragonguard — Dragoncraft follower, 4, 4/5. 竜使い.
// Ward.
// {[fanfare]} If Overflow is active for you, give this follower {[attack]}+2/{[defense]}+2.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* fx.giveStats(fx.self, 2, 2);
      },
    }),
  ],
});
