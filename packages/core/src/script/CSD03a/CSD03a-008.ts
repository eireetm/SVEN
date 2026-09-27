// CSD03a-008 Knight of Silence, Gallatin — Swordcraft follower, 5, 5/4. ヴァンガード・ロイヤルパラディン.
// {[ride]} {[cost01]}: Give this follower Drive. (CR 14.4.9.)
// On Drive - Give this follower {[attack]}+1/{[defense]}+1. Deal 3 damage to each enemy leader.
// {[fanfare]} Select an enemy follower on the field and deal it 5 damage.
import { defineCard, fanfare, onDrive, rideAbility } from "../helpers";
import { enemyFollower } from "../targets";
import { damageEnemyLeader } from "../CP03/shared";

export default defineCard({
  abilities: [
    rideAbility(1),
    onDrive({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
        yield* damageEnemyLeader(fx, 3);
      },
    }),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
  ],
});
