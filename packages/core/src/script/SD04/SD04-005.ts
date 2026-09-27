// SD04-005 Dragonewt Princess — Dragoncraft follower, 2, 2/3. ドラゴニュート・プリンセス.
// {[fanfare]} If Overflow is active for you, select an enemy follower on the field and deal it 4 damage.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower({ when: (g, c) => g.overflow(c) })],
      *resolve(fx) {
        const target = fx.targets[0]?.[0];
        if (target !== undefined) yield* fx.dealDamage(target, 4);
      },
    }),
  ],
});
