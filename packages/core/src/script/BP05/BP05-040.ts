// BP05-040 Safira, Synthetic Beast — Runecraft follower, 4, 2/6. 魔法生物・禁忌.
// Rush.
// {[fanfare]} Give this follower {[attack]}+X. X equals the number of {[runecraft]} followers in
// your cemetery.
// {[act]} {[cost05]}: Give this follower Storm.
import { activated, defineCard, fanfare } from "../helpers";
import { and, isClass, isFollower } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const x = fx.game.cards(fx.controller, "cemetery").filter((id) => and(isFollower, isClass("Runecraft"))(fx.game, id)).length;
        yield* fx.giveStats(fx.self, x, 0);
      },
    }),
    activated(
      { playPoints: 5 },
      {
        *resolve(fx) {
          yield* fx.giveKeyword(fx.self, "storm");
        },
      },
    ),
  ],
});
