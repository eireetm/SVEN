// BP15-104 Zeno, Paradoxical Shield — Havencraft amulet, 1. 挑戦者・先導.
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal a follower with Ward from among them and add it to
// your hand. Put the rest on the bottom of your deck in any order.
// Activate {[engage]} this, bury this: Select a follower on your field with Ward and give it {[defense]}+1. Activate
// only if there are at least 3 followers on your field with Ward.
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { yourFollower } from "../targets";
import { wardFollower, wardFollowersOnField } from "./shared-haven";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: wardFollower, to: "hand" });
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, p) => wardFollowersOnField(g, p) >= 3,
        targets: [yourFollower({ filter: wardFollower })],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 0, 1);
        },
      },
    ),
  ],
});
