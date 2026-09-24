// BP05-023 Empyreal Swordsman — Swordcraft follower, 5, 5/4. 指揮官.
// At the start of your end phase, select an enemy follower on the field. Deal 4 damage to it and
// 2 damage to its leader. (No enemy follower: no leader damage either — ruling.)
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamages([
          { target, amount: 4 },
          { target: leader, amount: 2 },
        ]);
      },
    }),
  ],
});
