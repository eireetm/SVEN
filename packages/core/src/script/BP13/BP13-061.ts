// BP13-061 Flame Pillar Dragonewt — Dragoncraft follower, 4, 3/3. ドラゴニュート・武闘竜人.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Select an enemy follower on the field and, if Overflow is active for you, deal it 4 damage.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
