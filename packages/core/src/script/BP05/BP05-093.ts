// BP05-093 Disciple of Repose — Havencraft follower, 2, 2/2. 絶傑・狂信.
// At the start of each opponent's main phase, select an enemy follower on the field and deal it 1
// damage.
import { atStartOfOpponentsMainPhase, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    atStartOfOpponentsMainPhase({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
      },
    }),
  ],
});
