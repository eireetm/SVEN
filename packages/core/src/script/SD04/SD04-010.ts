// SD04-010 Roc (Evolved) — 3/3.
// Strike: Give this follower {[attack]}+1/{[defense]}+1. (It lasts after the attack — ruling.)
import { defineCard, strike } from "../helpers";

export default defineCard({
  abilities: [
    strike({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
