// CP03-121 Lozenge Magus — Havencraft follower, 1, 1/1. ヴァンガード・オラクルシンクタンク. Heal Trigger.
// Ward.
// {[fanfare]} Look at the top 2 cards of your deck. Put any number of them on the top of your deck in any order. Put the rest on
// the bottom in any order.
// Whenever you drive check a Trigger, give your leader {[defense]}+1. (Only a resolved Trigger — ruling.)
// ----------
// (If this card is revealed by a drive check, give your leader {[defense]}+3.) (Resolved by the engine.)
import { defineCard, fanfare, whenYouDriveCheckTrigger } from "../helpers";
import { arrangeTop } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* arrangeTop(fx, 2);
      },
    }),
    whenYouDriveCheckTrigger({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
