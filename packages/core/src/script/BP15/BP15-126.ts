// BP15-126 Fluffy Angel — Neutral follower, 2, 2/3. 天使.
// {[fanfare]}/{[lastwords]} Give your leader {[defense]}+1.
import { defineCard, fanfare, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
