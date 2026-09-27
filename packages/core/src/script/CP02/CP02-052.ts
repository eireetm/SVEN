// CP02-052 Akari Tsujino — Dragoncraft follower, 4, 4/5. デレマス・キュート.
// Ward.
// {[fanfare]} Give your leader {[defense]}+3. If you have 10 max play points, deal 3 damage to each enemy leader.
// Whenever this follower takes at least 5 damage, increase your max play points by 1. (Each damage separately, also one that
// destroys it: 3 and then 2 damage don't count — rulings.)
import { defineCard, fanfare, whenThisTakesDamage } from "../helpers";
import { damageEnemyLeader, maxPlayPointsTen } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
        if (maxPlayPointsTen(fx.game, fx.controller)) yield* damageEnemyLeader(fx, 3);
      },
    }),
    whenThisTakesDamage({
      *resolve(fx) {
        if ((fx.data?.count ?? 0) >= 5) yield* fx.increaseMaxPlayPoints(1);
      },
    }),
  ],
});
