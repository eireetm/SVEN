// BP16-T01 Guardian Golem — Runecraft follower token, 3, 3/5. ゴーレム.
// Ward.
// {[lastwords]} Give your leader {[defense]}+2.
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
