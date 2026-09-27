// CSD03a-011 Knight of Rose, Morgana — Swordcraft follower, 2, 2/2. ヴァンガード・ロイヤルパラディン.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9.)
// On Drive - Select up to 1 enemy follower on the field. Deal it 2 damage and give this follower {[attack]}+1/{[defense]}+1.
// Strike - Discard a Royal Paladin card: Give this follower {[attack]}+1/{[defense]}+1. (Ordered freely with the drive check —
// ruling.)
import { discardA } from "../costs";
import { defineCard, onDrive, rideAbility, strike } from "../helpers";
import { enemyFollower } from "../targets";
import { royalPaladin } from "../CP03/shared";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      targets: [enemyFollower({ upTo: true })],
      *resolve(fx) {
        const target = fx.targets[0]?.[0];
        if (target !== undefined) yield* fx.dealDamage(target, 2);
        yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
    strike({
      cost: discardA(royalPaladin),
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
