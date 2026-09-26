// BP14-058 Dragonskull Bludgeoner — Dragoncraft follower, 1, 2/2. 竜族・武闘竜人・キラー.
// {[fanfare]} Select an enemy follower on the field and, if Overflow is active for you, deal it 3 damage.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
