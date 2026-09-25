// BP07-065 Doting Dragoneer — Dragoncraft follower, 2, 2/2. 竜使い.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} If Overflow is active for you, select an enemy follower on the field and deal it 2
// damage.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      targets: [enemyFollower({ when: (g, c) => g.overflow(c) })],
      *resolve(fx) {
        const target = fx.targets[0]?.[0];
        if (target !== undefined) yield* fx.dealDamage(target, 2);
      },
    }),
  ],
});
