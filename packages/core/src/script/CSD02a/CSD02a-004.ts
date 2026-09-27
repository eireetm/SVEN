// CSD02a-004 Chika Yokoyama — Runecraft follower, 1, 2/2. デレマス・キュート.
// {[fanfare]} If there are at least 5 Cute cards in your cemetery, give this follower {[attack]}+1/{[defense]}+2 and Ward.
import { defineCard, fanfare } from "../helpers";
import { cute, inYourCemetery } from "../CP02/shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (inYourCemetery(fx.game, fx.controller, cute) < 5) return;
        yield* fx.giveStats(fx.self, 1, 2);
        yield* fx.giveKeyword(fx.self, "ward");
      },
    }),
  ],
});
