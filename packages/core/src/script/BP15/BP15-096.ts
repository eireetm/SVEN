// BP15-096 Wilbert, Luminous Paladin — Havencraft follower, 4, 3/4. 挑戦者・先導.
// Ward.
// {[fanfare]} Look at the top 5 cards of your deck. You may summon a follower with Ward that costs 2 or less from
// among them. Put the rest on the bottom of your deck in any order. (元のコスト.)
// Activate {[engage]} this: Select an enemy follower on the field and destroy it. Activate only if there are at
// least 3 followers on your field with Ward.
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { and, costAtMost, enemyFollower } from "../targets";
import { wardFollower, wardFollowersOnField } from "./shared-haven";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, { filter: and(wardFollower, costAtMost(2)), to: "field" });
      },
    }),
    activated(
      { engageSelf: true },
      {
        condition: (g, p) => wardFollowersOnField(g, p) >= 3,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.destroy(fx.targets[0]!);
        },
      },
    ),
  ],
});
