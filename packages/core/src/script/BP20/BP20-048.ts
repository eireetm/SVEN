// BP20-048 Supplicant of Destruction — Runecraft follower, 2, 2/3. 絶傑・アイドル.
// Activate {[engage]} this and bury another Idolatry card on your field: Select an enemy leader or enemy follower on the
// field and deal it 2 damage.
import { activated, defineCard } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";
import { buryAnotherIdolatry } from "./shared-rune";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true, custom: buryAnotherIdolatry },
      {
        targets: [enemyLeaderOrFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
    ),
  ],
});
