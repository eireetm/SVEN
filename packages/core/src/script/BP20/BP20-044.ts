// BP20-044 Congregant of Destruction — Runecraft follower, 6, 5/5. 絶傑・アイドル.
// {[fanfare]} Bury another Idolatry card on your field: Select an enemy follower on the field. Destroy it and deal its leader
// 2 damage. (CR 10.4.7.4.)
// Activate Bury another Idolatry card on your field: Select an enemy follower on the field. Destroy it and deal its leader
// 2 damage. Activate only once per turn.
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { buryAnotherIdolatry } from "./shared-rune";

function* destroyAndHitLeader(fx: EffectContext): Proc<void> {
  const target = fx.targets[0]![0]!;
  const leader = fx.game.leader(fx.game.controller(target));
  yield* fx.destroy([target]);
  yield* fx.dealDamage(leader, 2);
}

export default defineCard({
  abilities: [
    fanfare({ cost: buryAnotherIdolatry, targets: [enemyFollower()], resolve: destroyAndHitLeader }),
    activated({ custom: buryAnotherIdolatry }, { oncePerTurn: true, targets: [enemyFollower()], resolve: destroyAndHitLeader }),
  ],
});
