// BP02-034 Gunner Maid Seria — Swordcraft follower, 2, 1/3.
// {[fanfare]} Search your deck for a Princess follower, reveal it, and add it to your hand.
import { defineCard, fanfare } from "../helpers";
import { and, hasTrait, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => and(isFollower, hasTrait("プリンセス"))(fx.game, id));
      },
    }),
  ],
});
