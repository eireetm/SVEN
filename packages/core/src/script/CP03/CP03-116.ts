// CP03-116 Dark Cat — Havencraft follower, 2, 2/2. ヴァンガード・オラクルシンクタンク.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Give this follower {[attack]}+1/{[defense]}+1. Look at the top 3 cards of your deck. You may reveal an Oracle Think
// Tank follower from among them and add it to your hand. Put any number of them on the top of your deck in any order. Put the rest
// on the bottom in any order.
import { defineCard, onDrive, rideAbility } from "../helpers";
import { arrangeTop, followerThat, oracleThinkTank } from "./shared";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
        const top = fx.topCards(3);
        const taken = yield* fx.selectCards(top.filter((id) => followerThat(oracleThinkTank)(fx.game, id)), 0, 1, fx.controller, top);
        if (taken.length > 0) {
          yield* fx.reveal(taken);
          yield* fx.returnToHand(taken);
        }
        yield* arrangeTop(fx, 3, top.filter((id) => !taken.includes(id)));
      },
    }),
  ],
});
