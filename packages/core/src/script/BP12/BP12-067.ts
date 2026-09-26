// BP12-067 Dragon Aficionado — Dragoncraft follower, 2, 2/3. 竜使い.
// {[fanfare]} If Overflow is active for you, search your deck for a 1-cost {[dragoncraft]} follower,
// reveal it, add it to your hand, then shuffle.
import { defineCard, fanfare } from "../helpers";
import { and, costAtLeast, costAtMost, isClass, isFollower } from "../targets";

const oneCostDragoncraftFollower = and(isFollower, isClass("Dragoncraft"), costAtLeast(1), costAtMost(1));

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, p) => g.overflow(p),
      *resolve(fx) {
        yield* fx.search((id) => oneCostDragoncraftFollower(fx.game, id));
      },
    }),
  ],
});
