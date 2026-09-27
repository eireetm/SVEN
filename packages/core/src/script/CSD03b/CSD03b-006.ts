// CSD03b-006 Berserk Dragon — Dragoncraft follower, 3, 3/3. ヴァンガード・かげろう.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9.)
// On Drive - Select up to 1 enemy follower on the field. Deal it 3 damage and give this follower {[attack]}+1/{[defense]}+1.
// {[fanfare]} Discard a Kagero card: Select an enemy follower on the field and deal it 2 damage.
import { discardA } from "../costs";
import { defineCard, fanfare, onDrive, rideAbility } from "../helpers";
import { enemyFollower } from "../targets";
import { kagero } from "../CP03/shared";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      targets: [enemyFollower({ upTo: true })],
      *resolve(fx) {
        const target = fx.targets[0]?.[0];
        if (target !== undefined) yield* fx.dealDamage(target, 3);
        yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
    fanfare({
      cost: discardA(kagero),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
  ],
});
