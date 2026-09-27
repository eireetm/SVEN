// CP03-112 Battle Sister, Cocoa — Havencraft follower, 4, 3/3. ヴァンガード・オラクルシンクタンク.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Give this follower {[attack]}+1/{[defense]}+1. Look at the top 5 cards of your deck. Put any number of them on the top
// of your deck in any order. Put the rest on the bottom in any order.
// Whenever you drive check a Trigger, select an enemy follower on the field. Deal it 4 damage and give your leader
// {[defense]}+2. (Not played without an enemy follower, so no +2 either — ruling.)
import { defineCard, onDrive, rideAbility, whenYouDriveCheckTrigger } from "../helpers";
import { enemyFollower } from "../targets";
import { arrangeTop } from "./shared";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
        yield* arrangeTop(fx, 5);
      },
    }),
    whenYouDriveCheckTrigger({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
