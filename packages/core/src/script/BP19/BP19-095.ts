// BP19-095 Zoe, Queen of Hope — Havencraft follower, 4, 4/4. 信仰・プリンセス.
// Ward.
// {[fanfare]} Search your deck for a 1-cost Faith follower, reveal it, add it to your hand, then shuffle. Give your leader
// {[defense]}+4. (元のコスト.)
import { defineCard, fanfare } from "../helpers";
import { costAtLeast, costAtMost, isFollower } from "../targets";
import { faith } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => isFollower(g, id) && faith(g, id) && costAtLeast(1)(g, id) && costAtMost(1)(g, id));
        yield* fx.giveLeaderDefense(fx.controller, 4);
      },
    }),
  ],
});
