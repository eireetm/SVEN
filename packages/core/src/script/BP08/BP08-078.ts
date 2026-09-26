// BP08-078 Salome — Abysscraft follower, 3, 1/2. 死霊術師・プリンセス.
// {[fanfare]}/{[lastwords]} Select an enemy follower, deal it 2 damage, and give your leader +1
// defense. With no target, neither part is played (ruling, CR 10.6.2.3, 12.4.3, 12.5.3).
import type { EffectContext } from "../../engine/effects/context";
import { defineCard, fanfare, lastWords } from "../helpers";
import { enemyFollower } from "../targets";

function* damageAndRecover(fx: EffectContext) {
  yield* fx.dealDamage(fx.targets[0]![0]!, 2);
  yield* fx.giveLeaderDefense(fx.controller, 1);
}

export default defineCard({
  abilities: [
    fanfare({ targets: [enemyFollower()], resolve: damageAndRecover }),
    lastWords({ targets: [enemyFollower()], resolve: damageAndRecover }),
  ],
});
