// BP01-006 Robin Hood — Forestcraft follower, 5, 4/5.
// {[fanfare]} Select an enemy follower on the field and deal it 4 damage.
// {[act]}{[cost01]}, {[engage]}: Select an enemy follower on the field and deal it 4 damage.
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import type { EffectContext } from "../../engine/effects/context";

function* deal4(fx: EffectContext) {
  yield* fx.dealDamage(fx.targets[0]![0]!, 4);
}

export default defineCard({
  abilities: [
    fanfare({ targets: [enemyFollower()], resolve: deal4 }),
    activated({ playPoints: 1, engageSelf: true }, { targets: [enemyFollower()], resolve: deal4 }),
  ],
});
