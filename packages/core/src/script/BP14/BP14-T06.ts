// BP14-T06 Fox of Invitation — Havencraft follower token, 1, 0/1. 宴楽・狂信・獣.
// Ward.
// {[fanfare]} Give your leader {[defense]}+1.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
