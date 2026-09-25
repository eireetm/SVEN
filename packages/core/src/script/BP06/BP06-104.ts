// BP06-104 Barrage Brawler (Evolved) — Havencraft follower, 1/2. 信仰.
// On Evolve - Recover 2 play points. (Never above the maximum — ruling, CR 5.15.1.1.)
// At the start of your end phase, if you have at least 2 play points, select an enemy leader and
// deal it 1 damage.
import { atStartOfYourEndPhase, defineCard, onEvolve } from "../helpers";
import { enemyLeader } from "../targets";
import { playPointsOf } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.recoverPlayPoints(2);
      },
    }),
    atStartOfYourEndPhase({
      targets: [enemyLeader({ when: (g, c) => playPointsOf(g, c) >= 2 })],
      *resolve(fx) {
        const leader = fx.targets[0]?.[0];
        if (leader !== undefined) yield* fx.dealDamage(leader, 1);
      },
    }),
  ],
});
