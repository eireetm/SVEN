// CP04-066 Wyrm — Dragoncraft follower, 2, 3/2. プリコネ・〈ジオ・テオゴニア〉.
// {[ub]} Activate {[engage]} this: Select an enemy follower on the field. Deal it 3 damage and, if there's a follower on your field
// that costs 7 or more, deal 3 damage to its leader. (元のコスト. Without an enemy follower it can't be activated — ruling.)
// {[fanfare]} If there are no other Geo Theogonia followers on your field, {[engage]} this.
import { activated, defineCard, fanfare, ub } from "../helpers";
import { costAtLeast, enemyFollower } from "../targets";
import { followerThat, geoTheogonia } from "./shared";

export default defineCard({
  abilities: [
    ub(
      activated(
        { engageSelf: true },
        {
          targets: [enemyFollower()],
          *resolve(fx) {
            const target = fx.targets[0]![0]!;
            const leader = fx.game.leader(fx.game.controller(target));
            yield* fx.dealDamage(target, 3);
            if (fx.game.followers(fx.controller).some((id) => costAtLeast(7)(fx.game, id))) yield* fx.dealDamage(leader, 3);
          },
        },
      ),
    ),
    fanfare({
      condition: (g, c, self) => !g.followers(c).some((id) => id !== self && followerThat(geoTheogonia)(g, id)),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.engage([fx.self]);
      },
    }),
  ],
});
