// BP10-056 Aiela, Devoted Knight — Dragoncraft follower, 5, 2/2. 竜使い.
// {[fanfare]} Choose one. (1) Increase your max play points by 1. Recover 2 play points. (2) If
// Overflow is active for you, summon a Devoted Dragon token and give your leader {[defense]}+2.
// ((2) can be chosen without Overflow and then does nothing; play points never go above the maximum
// — rulings, CR 5.15.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "points",
          label: "(1) Max play points +1, recover 2 play points",
          *resolve(fx) {
            yield* fx.increaseMaxPlayPoints(1);
            yield* fx.recoverPlayPoints(2);
          },
        },
        {
          id: "dragon",
          label: "(2) Overflow: summon a Devoted Dragon, leader +2 defense",
          *resolve(fx) {
            if (!fx.game.overflow(fx.controller)) return;
            yield* fx.summon(["Devoted Dragon"]);
            yield* fx.giveLeaderDefense(fx.controller, 2);
          },
        },
      ],
    }),
  ],
});
