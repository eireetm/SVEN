// BP13-102 Turquoise Sister — Havencraft follower, 7, 4/7. 信仰.
// Ward.
// {[fanfare]} Search your deck for a Faith follower with 2 attack or less, summon it, then shuffle.
import { defineCard, fanfare } from "../helpers";
import { and, hasTrait, isFollower } from "../targets";

const faithFollower = and(isFollower, hasTrait("信仰"));

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        yield* fx.search((id) => faithFollower(g, id) && (g.info(id).attack ?? Infinity) <= 2, { to: "field" });
      },
    }),
  ],
});
