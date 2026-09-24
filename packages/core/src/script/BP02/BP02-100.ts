// BP02-100 Frog Cleric — Havencraft follower, 2, 2/2.
// {[fanfare]} Give your leader {[defense]}+2.
// {[act]}{[cost02]}: Give your leader {[defense]}+1.
import { activated, defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
    activated(
      { playPoints: 2 },
      {
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
    ),
  ],
});
