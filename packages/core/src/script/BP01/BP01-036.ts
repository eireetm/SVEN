// BP01-036 Gemstaff Commander — Swordcraft follower, 3, 3/2.
// {[fanfare]} Search your deck for a {[swordcraft]} follower, reveal it, and add it to your hand.
import { defineCard, fanfare } from "../helpers";
import { and, isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => and(isFollower, isClass("Swordcraft"))(fx.game, id));
      },
    }),
  ],
});
