// BP14-102 Pegasus Knight — Havencraft follower, 4, 4/4. 信仰・獣.
// Rush.
// Once on each of your turns, when your leader gains {[defense]}, summon a Holy Falcon token.
// Whenever a {[havencraft]} token follower is put onto your field, select an enemy follower on the field and
// engage it. (Also during the opponent's turn — ruling.)
import { defineCard, whenFollowerEntersYourField, whenYourLeaderGainsDefense } from "../helpers";
import { and, enemyFollower, isClass, isToken } from "../targets";
import { yourTurn } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    whenYourLeaderGainsDefense({
      triggerIf: yourTurn,
      oncePerTurn: true,
      *resolve(fx) {
        yield* fx.summon(["Holy Falcon"]);
      },
    }),
    whenFollowerEntersYourField(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.engage(fx.targets[0]!);
        },
      },
      { filter: and(isToken, isClass("Havencraft")) },
    ),
  ],
});
