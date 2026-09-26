// BP20-100 Shining Disenchantment — Havencraft amulet, 2. 絶傑・狂信.
// {[fanfare]} Draw a card.
// Activate {[engage]} this, bury this: Select an enemy follower on the field and deal it 4 damage. Activate only if there are
// at least 3 crests in your EX area.
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { threeCrests } from "./shared-haven";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: threeCrests,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        },
      },
    ),
  ],
});
