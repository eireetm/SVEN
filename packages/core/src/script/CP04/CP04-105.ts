// CP04-105 Suzume — Havencraft follower, 2, 2/3. プリコネ・サレンディア救護院.
// {[ub]}{[fanfare]} Give your leader {[defense]}+2.
import { defineCard, fanfare, ub } from "../helpers";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 2);
        },
      }),
    ),
  ],
});
