// BP06-095 Phantom Blade Wielder (Evolved) — Havencraft follower, 3/3. 信仰.
// On Evolve - Select an enemy follower on the field and deal it 2 damage.
// At the start of your end phase, if you have at least 2 play points, select an enemy follower on
// the field and deal it 2 damage.
import { atStartOfYourEndPhase, defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { playPointsOf } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    atStartOfYourEndPhase({
      targets: [enemyFollower({ when: (g, c) => playPointsOf(g, c) >= 2 })],
      *resolve(fx) {
        const target = fx.targets[0]?.[0];
        if (target !== undefined) yield* fx.dealDamage(target, 2);
      },
    }),
  ],
});
