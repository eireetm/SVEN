// BP02-029 Swift Infiltrator — Swordcraft follower, 2, 2/2.
// Whenever a follower on your field evolves, give this follower {[attack]}+1/{[defense]}+1.
import { defineCard, whenYourFollowerEvolves } from "../helpers";

export default defineCard({
  abilities: [
    whenYourFollowerEvolves({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
