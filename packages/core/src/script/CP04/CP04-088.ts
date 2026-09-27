// CP04-088 Io — Abysscraft follower, 5, 3/4. プリコネ・ルーセント学院.
// {[ub]} Activate {[cost01]}: Each opponent buries a follower. Activate only once per turn. (A follower on their field, chosen by
// them.)
// {[fanfare]} Search your deck for a Lucent Academy follower that costs 3 or less and a 1-cost Lucent Academy follower, summon them,
// then shuffle. Their {[fanfare]} abilities don't trigger. (元のコスト — ruling: they can't be played.)
import { activated, defineCard, fanfare, ub } from "../helpers";
import { costAtMost } from "../targets";
import { costs, followerThat, lucentAcademy } from "./shared";

const lucentFollower = followerThat(lucentAcademy);

export default defineCard({
  abilities: [
    ub(
      activated(
        { playPoints: 1 },
        {
          oncePerTurn: true,
          *resolve(fx) {
            const opp = fx.game.opponent(fx.controller);
            const followers = fx.game.followers(opp);
            if (followers.length === 0) return;
            yield* fx.bury(yield* fx.chooseCards(followers, 1, 1, opp));
          },
        },
      ),
    ),
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const found = yield* fx.searchEach([(id) => lucentFollower(g, id) && costAtMost(3)(g, id), (id) => lucentFollower(g, id) && costs(1)(g, id)], {
          to: "field",
        });
        for (const id of found) if (g.card(id)?.zone === "field") yield* fx.blockFanfare(id);
      },
    }),
  ],
});
