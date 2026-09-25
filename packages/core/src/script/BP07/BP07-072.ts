// BP07-072 Aenea, Amethyst Rebel — Abysscraft follower, 4, 2/2. 機械・魔界.
// {[fanfare]} Search your deck for a Machina follower that costs 3 or less, summon it, then shuffle
// your deck. (元のコスト.)
// {[lastwords]} Give your leader {[defense]}+2.
import { defineCard, fanfare, lastWords } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";
import { machina } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => and(isFollower, machina, costAtMost(3))(fx.game, id), { to: "field" });
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
