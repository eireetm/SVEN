// BP21-103 Pureflower Maiden — Havencraft follower, 2, 2/3. 信仰・学院・光輝・獣.
// Once per turn, when this gains {[defense]}, draw a card. (CR 10.7.2.2; on the opponent's turn too — ruling.)
// Activate {[engage]} this: Give your leader {[defense]}+1. Activate only if there's another Academic follower on your field.
import { defineCard, whenThisGainsDefense } from "../helpers";
import { leaderPlusOne } from "./shared-haven";

export default defineCard({
  abilities: [
    {
      ...whenThisGainsDefense({
        *resolve(fx) {
          yield* fx.draw(1);
        },
      }),
      timesPerTurn: 1,
    },
    leaderPlusOne,
  ],
});
