// BP01-012 Elf Child May — Forestcraft follower, 1, 1/1.
// {[fanfare]} Select an enemy follower on the field and deal it 1 damage.
// When this card is returned to hand from your field, select an enemy follower on the field and
// deal it 1 damage.
import { defineCard, fanfare, whenReturnedToHand } from "../helpers";
import { enemyFollower } from "../targets";
import type { EffectContext } from "../../engine/effects/context";

function* deal1(fx: EffectContext) {
  yield* fx.dealDamage(fx.targets[0]![0]!, 1);
}

export default defineCard({
  abilities: [
    fanfare({ targets: [enemyFollower()], resolve: deal1 }),
    whenReturnedToHand({ targets: [enemyFollower()], resolve: deal1 }),
  ],
});
