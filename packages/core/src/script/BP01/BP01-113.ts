// BP01-113 Dark General — Abysscraft follower, 4, 5/5.
// {[fanfare]} If Sanguine is active for you, give this follower Storm.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.sanguine(fx.controller)) yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
