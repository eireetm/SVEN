// CSD02b-004 Yasuha Okazaki — Runecraft follower, 4, 4/4. デレマス・クール.
// {[fanfare]} Search your deck for a Cool follower that costs 2 or less, summon it, then shuffle your deck. (元のコスト.)
import { defineCard, fanfare } from "../helpers";
import { and, costAtMost } from "../targets";
import { cool, followerThat } from "../CP02/shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const filter = and(followerThat(cool), costAtMost(2));
        yield* fx.search((id) => filter(fx.game, id), { to: "field" });
      },
    }),
  ],
});
