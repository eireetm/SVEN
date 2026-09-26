// BP14-093 Impious Bishop — Havencraft follower, 4, 2/4. 狂信.
// Ward.
// {[fanfare]} Look at the top 5 cards of your deck. You may put a Zealot card that costs 2 or less from among them
// into your EX area. It costs 2 less to play this turn. Put the rest on the bottom of your deck in any order.
// Once per turn, when your leader gains {[defense]}, select an enemy follower on the field and deal it 4 damage.
// (Also during the opponent's turn — ruling.)
import { defineCard, fanfare, lookAtTopCards, whenYourLeaderGainsDefense } from "../helpers";
import { and, costAtMost, enemyFollower } from "../targets";
import { zealot } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        for (const id of yield* lookAtTopCards(fx, 5, { filter: and(zealot, costAtMost(2)), to: "ex" })) {
          yield* fx.changePlayCost(id, -2, "endOfTurn");
        }
      },
    }),
    whenYourLeaderGainsDefense({
      oncePerTurn: true,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
