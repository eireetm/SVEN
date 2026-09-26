// BP13-047 Riven Earth — Runecraft spell, 1. 魔法使い.
// Select an enemy follower on the field and deal it 2 damage. If there are at least 2 Mage followers on
// your field, deal 4 damage instead and deal 1 damage to its leader. (Both under the condition, as the
// English says.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { mage } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        const mages = fx.game.followers(fx.controller).filter((id) => mage(fx.game, id)).length;
        yield* fx.dealDamage(target, mages >= 2 ? 4 : 2);
        if (mages >= 2) yield* fx.dealDamage(leader, 1);
      },
    }),
  ],
});
