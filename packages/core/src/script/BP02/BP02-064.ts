// BP02-064 Mushussu — Dragoncraft follower, 2, 2/3.
// Whenever one of your followers evolves, give this follower {[attack]}+2.
import { defineCard, whenYourFollowerEvolves } from "../helpers";

export default defineCard({
  abilities: [
    whenYourFollowerEvolves({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 2, 0);
      },
    }),
  ],
});
