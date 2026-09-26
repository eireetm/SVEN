// BP12-099 Robowing Precant — Havencraft follower, 2, 2/2. 機械・信仰.
// {[fanfare]} Put a Repair Mode token into your EX area. Then, if there are at least 3 cards named Repair
// Mode in your EX area, draw a card. (Counted after the token — ruling.)
// Whenever you play a Repair Mode, select a follower on your field and give it Bane. (Also during the
// opponent's turn — ruling.)
import { defineCard, fanfare, whenYouPlay } from "../helpers";
import { yourFollower } from "../targets";
import { REPAIR, countIn, isRepairMode } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([REPAIR]);
        if (countIn(fx.game, fx.controller, "ex", isRepairMode) >= 3) yield* fx.draw(1);
      },
    }),
    whenYouPlay(
      {
        targets: [yourFollower()],
        *resolve(fx) {
          yield* fx.giveKeyword(fx.targets[0]![0]!, "bane");
        },
      },
      isRepairMode,
    ),
  ],
});
