// CP04-T05 Mirror Image Neneka — Runecraft follower token, 2, 0/1. プリコネ・七冠.
// Ward.
// Activate {[engage]} this: Select an enemy follower on the field and deal it 1 damage.
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    activated(
      { engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
    ),
  ],
});
