// CP03-075 Demonic Dragon Mage, Kimnara — Dragoncraft spell, 3. ヴァンガード・かげろう.
// {[quick]}
// Select an enemy follower on the field and deal it 6 damage.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 6);
      },
    }),
  ],
});
