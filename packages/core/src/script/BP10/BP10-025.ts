// BP10-025 Ilmisuna, Discord Hawker — Swordcraft follower, 3, 3/3. 兵士・商人.
// Activate {[engage]}: Select an enemy follower on the field and deal it 3 damage. If there's a
// Merchant follower not named Ilmisuna, Discord Hawker on your field, deal 5 damage instead.
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";
import { otherMerchantOnField } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const x = otherMerchantOnField(fx.game, fx.controller, "Ilmisuna, Discord Hawker") ? 5 : 3;
          yield* fx.dealDamage(fx.targets[0]![0]!, x);
        },
      },
    ),
  ],
});
