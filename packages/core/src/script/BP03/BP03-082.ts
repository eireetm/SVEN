// BP03-082 Trombone Devil (Evolved) — Abysscraft, 5/5.
// On Evolve: Deal 1 to each leader.
// At the start of your end phase, if Sanguine is active, select an enemy leader or follower and deal 3.
import { atStartOfYourEndPhase, defineCard, onEvolve } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.dealDamages([
          { target: fx.game.leader(fx.controller), amount: 1 },
          { target: fx.game.leader(fx.game.opponent(fx.controller)), amount: 1 },
        ]);
      },
    }),
    atStartOfYourEndPhase({
      condition: (g, p) => g.sanguine(p),
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
