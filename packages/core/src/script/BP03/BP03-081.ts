// BP03-081 Trombone Devil — Abysscraft follower, 5, 4/4. 魔界.
// {[evolve]} {[cost01]}: Evolve.
// At the start of your end phase, if Sanguine is active for you, select an enemy leader or
// follower and deal it 3 damage.
import { atStartOfYourEndPhase, defineCard, evolveAbility } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    atStartOfYourEndPhase({
      condition: (g, p) => g.sanguine(p),
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
