// SD04-014 Seabrand Dragon — Dragoncraft follower, 4, 4/4. 海洋.
// {[fanfare]} If Overflow is active for you, give this follower Storm.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
