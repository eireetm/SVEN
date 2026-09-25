// BP06-094 Phantom Blade Wielder — Havencraft follower, 2, 2/2. 信仰.
// {[evolve]} {[cost01]}: Evolve this follower.
// At the start of your end phase, if you have at least 2 play points, select an enemy follower on
// the field and deal it 2 damage.
import { atStartOfYourEndPhase, defineCard, evolveAbility } from "../helpers";
import { enemyFollower } from "../targets";
import { playPointsOf } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    atStartOfYourEndPhase({
      targets: [enemyFollower({ when: (g, c) => playPointsOf(g, c) >= 2 })],
      *resolve(fx) {
        const target = fx.targets[0]?.[0];
        if (target !== undefined) yield* fx.dealDamage(target, 2);
      },
    }),
  ],
});
