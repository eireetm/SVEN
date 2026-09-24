// BP05-012 Servant of Unkilling — Forestcraft follower, 1, 2/2. 絶傑・狩人.
// {[fanfare]} If there are at least 3 Hunter cards in your cemetery, give your leader {[defense]}+2.
import { defineCard, fanfare } from "../helpers";
import { threeHunters } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (threeHunters(fx.game, fx.controller)) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
