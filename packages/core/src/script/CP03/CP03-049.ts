// CP03-049 Golden Beast Tamer — Runecraft follower, 4, 4/4. ヴァンガード・ペイルムーン.
// {[fanfare]} Select a Pale Moon follower that costs 2 or less in your banished zone and summon it. (元のコスト.)
// Activate {[engage]}: Select an enemy follower on the field and deal it damage equal to the number of Pale Moon followers on
// your field.
import { activated, defineCard, fanfare } from "../helpers";
import { costAtMost, enemyFollower, inYourZone } from "../targets";
import { followerThat, paleMoon } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [inYourZone("banished", { filter: (g, id) => followerThat(paleMoon)(g, id) && costAtMost(2)(g, id) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const n = fx.game.followers(fx.controller).filter((id) => paleMoon(fx.game, id)).length;
          if (n > 0) yield* fx.dealDamage(fx.targets[0]![0]!, n);
        },
      },
    ),
  ],
});
