// BP01-038 Swordsman — Swordcraft follower, 1, 2/1.
// {[fanfare]} Select an enemy follower on the field and engage it.
// {[act]}{[engage]}: Select an enemy follower on the field and engage it.
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import type { EffectContext } from "../../engine/effects/context";

function* engageIt(fx: EffectContext) {
  yield* fx.engage(fx.targets[0]!);
}

export default defineCard({
  abilities: [
    fanfare({ targets: [enemyFollower()], resolve: engageIt }),
    activated({ engageSelf: true }, { targets: [enemyFollower()], resolve: engageIt }),
  ],
});
