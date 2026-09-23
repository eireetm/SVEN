// BP01-117 Skeleton Fighter — Abysscraft follower, 1, 2/2.
// {[fanfare]} If Sanguine is active for you, give this follower +1/+1.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.sanguine(fx.controller)) yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
