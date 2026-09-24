// BP05-038 Apostle of Truth — Runecraft follower, 3, 3/3. 絶傑・魔法使い.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} If there are at least 3 Mage followers on your field, give this follower
// {[attack]}+2/{[defense]}+2 and Ward. (This follower counts.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { mageFollowers } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (mageFollowers(fx.game, fx.controller) < 3) return;
        yield* fx.giveStats(fx.self, 2, 2);
        yield* fx.giveKeyword(fx.self, "ward");
      },
    }),
  ],
});
