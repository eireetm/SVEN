// BP10-011 Optimistic Beastmaster — Forestcraft follower, 4, 3/3. アルカナ・エルフ族.
// {[fanfare]} Look at the top 3 cards of your deck. You may put one of them into your EX area. Put the
// rest on the bottom of your deck in any order.
// Activate {[engage]}: Select an enemy follower on the field and deal it damage equal to the number of
// cards with different base costs in your EX area. (元のコストの種類数.)
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { enemyFollower } from "../targets";
import { distinctCostsInEx } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: () => true, to: "ex" });
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, distinctCostsInEx(fx.game, fx.controller));
        },
      },
    ),
  ],
});
