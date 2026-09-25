// BP07-047 Prototype Warrior — Runecraft follower, 1, 2/1. 機械・ゴーレム.
// {[fanfare]} Choose one of the following. (1) Put an Assembly Droid token into your EX area. (2) If
// there are at least 3 Machina cards in your EX area, give this follower {[attack]}+1/{[defense]}+1
// and Rush.
import { defineCard, fanfare } from "../helpers";
import { DROID, countIn, machina } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      modes: [
        {
          id: "droid",
          label: "(1) Put an Assembly Droid into your EX area",
          *resolve(fx) {
            yield* fx.tokensToEx([DROID]);
          },
        },
        {
          id: "rush",
          label: "(2) With 3 Machina cards in your EX area: +1/+1 and Rush",
          *resolve(fx) {
            if (countIn(fx.game, fx.controller, "ex", machina) < 3) return;
            yield* fx.giveStats(fx.self, 1, 1);
            yield* fx.giveKeyword(fx.self, "rush");
          },
        },
      ],
    }),
  ],
});
