// CP03-012 Light Signals Penguin Soldier — Forestcraft follower, 2, 2/2. ヴァンガード・アクアフォース.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Give this follower {[attack]}+1/{[defense]}+1. Look at the top card of your deck. You may reveal it and add it to
// your hand. If you revealed a 1-cost Aqua Force follower, give your leader {[defense]}+2. (元のコスト.)
import { defineCard, onDrive, rideAbility } from "../helpers";
import { aquaForce, followerThat, mayTakeTopCard } from "./shared";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
        const taken = yield* mayTakeTopCard(fx);
        if (taken !== null && followerThat(aquaForce)(fx.game, taken) && fx.game.info(taken).cost === 1) {
          yield* fx.giveLeaderDefense(fx.controller, 2);
        }
      },
    }),
  ],
});
