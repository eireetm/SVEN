// BP21-034 Levin Archer — Swordcraft follower, 2, 2/2. 兵士・レヴィオン.
// {[fanfare]} Look at the top 2 cards of your deck. You may reveal a Levin card from among them and add it to your hand. Bury
// the rest.
// Activate {[engage]} this: Select an enemy follower on the field and, if there are at least 5 Levin cards in your cemetery,
// deal it 3 damage.
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { enemyFollower } from "../targets";
import { levin, levinsInCemetery } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: levin, to: "hand", rest: "cemetery" });
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          if (levinsInCemetery(fx.game, fx.controller) >= 5) yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
    ),
  ],
});
