// BP07-T01 Assembly Droid — Neutral follower token, 1, 1/1. 機械.
// Activate {[engage]}, bury 3 Machina followers: Select an enemy follower on the field and deal it 5
// damage. (Followers on your field; this one may be among them — ruling.)
import { buryFromYourField } from "../costs";
import { activated, defineCard } from "../helpers";
import { and, enemyFollower, isFollower } from "../targets";
import { machina } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true, custom: buryFromYourField(and(isFollower, machina), 3) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        },
      },
    ),
  ],
});
