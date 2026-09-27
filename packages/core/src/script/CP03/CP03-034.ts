// CP03-034 Pongal — Swordcraft follower, 2, 2/2. ヴァンガード・ロイヤルパラディン.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9: a Drive Point is linked; once per card per game.)
// On Drive - Give this follower {[attack]}+1/{[defense]}+1. Look at the top card of your deck. You may reveal it and add it to
// your hand. If you revealed a Royal Paladin card, deal 1 damage to each enemy leader.
import { defineCard, onDrive, rideAbility } from "../helpers";
import { damageEnemyLeader, mayTakeTopCard, royalPaladin } from "./shared";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
        const taken = yield* mayTakeTopCard(fx);
        if (taken !== null && royalPaladin(fx.game, taken)) yield* damageEnemyLeader(fx, 1);
      },
    }),
  ],
});
