// CP04-112 Lyrael — Neutral follower, 7, 3/4. プリコネ・〈ジオ・テオゴニア〉.
// {[ub]}{[fanfare]} Select up to 3 followers in your cemetery with different names that cost 2 or less and summon them. (元のコスト.
// With none it selects 0 and is executed; their Fanfares resolve in any order — rulings.)
// Whenever a {[ub]} ability of another follower on your field is executed, give that follower {[attack]}+1/{[defense]}+1.
import { defineCard, fanfare, ub, whenAnotherFollowersUnionBurst } from "../helpers";
import { costAtMost, inYourZone, isFollower } from "../targets";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        targets: [inYourZone("cemetery", { filter: (g, id) => isFollower(g, id) && costAtMost(2)(g, id), count: 3, upTo: true, distinctNames: true })],
        *resolve(fx) {
          yield* fx.putOntoField(fx.targets[0]!);
        },
      }),
    ),
    whenAnotherFollowersUnionBurst({
      *resolve(fx) {
        const follower = fx.data?.card;
        if (follower !== undefined && fx.game.card(follower)?.zone === "field") yield* fx.giveStats(follower, 1, 1);
      },
    }),
  ],
});
