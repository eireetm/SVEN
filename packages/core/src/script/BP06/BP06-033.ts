// BP06-033 Levin Scholar — Swordcraft follower, 3, 3/3. 兵士・レヴィオン.
// {[fanfare]} Search your deck for a Levin follower, reveal it, add it to your hand, then shuffle
// your deck.
import { defineCard, fanfare } from "../helpers";
import { and, hasTrait, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => and(isFollower, hasTrait("レヴィオン"))(fx.game, id));
      },
    }),
  ],
});
