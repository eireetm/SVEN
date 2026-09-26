// BP08-084 Zealot of Lust — Abysscraft follower, 2, 3/2. 絶傑・魔界・キラー.
// Activate Give your leader {[defense]}-1: Select an enemy follower on the field and deal it 1
// damage. Activate only twice per turn. (Without a target it can't be played, so the cost isn't paid
// — ruling, CR 10.4.5, 10.6.2.3.3.)
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { leaderDefense: 1 },
      {
        timesPerTurn: 2,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
    ),
  ],
});
