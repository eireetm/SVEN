// BP14-101 Fox of Fortune — Havencraft follower, 2, 2/3. 宴楽・狂信・獣.
// Ward.
// {[fanfare]} Put a Fox of Invitation token into your EX area.
// Whenever your leader gains {[defense]}, engage this: Draw a card. (Also during the opponent's turn — ruling;
// CR 10.4.7.4.)
import { engageThis } from "../costs";
import { defineCard, fanfare, whenYourLeaderGainsDefense } from "../helpers";
import { FOX } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([FOX]);
      },
    }),
    whenYourLeaderGainsDefense({
      cost: engageThis,
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
