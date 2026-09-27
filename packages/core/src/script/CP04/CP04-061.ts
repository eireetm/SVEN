// CP04-061 Hiyori — Dragoncraft follower, 4, 4/4. プリコネ・トゥインクルウィッシュ.
// {[ub]} Strike - Select an enemy follower on the field. Deal 2 damage to it and its leader. If you have 10 max play points, deal 4
// damage instead.
// Rush.
// {[fanfare]} Search your deck for a 1-cost Twinkle Wish follower, put it into your EX area, then shuffle. (元のコスト.)
import { defineCard, fanfare, strike, ub } from "../helpers";
import { enemyFollower } from "../targets";
import { costs, followerThat, tenMaxPlayPoints, twinkleWish } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    ub(
      strike({
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          const amount = tenMaxPlayPoints(fx.game, fx.controller) ? 4 : 2;
          yield* fx.dealDamages([
            { target, amount },
            { target: fx.game.leader(fx.game.controller(target)), amount },
          ]);
        },
      }),
    ),
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => followerThat(twinkleWish)(fx.game, id) && costs(1)(fx.game, id), { to: "ex" });
      },
    }),
  ],
});
