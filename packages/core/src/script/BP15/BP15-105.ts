// BP15-105 Crusader's Rallying Cry — Havencraft amulet, 3. 信仰・獣.
// {[fanfare]} Summon a Holy Tiger token.
// Activate {[engage]} this, bury this: Select an enemy follower on the field and deal it 2 damage. Activate only if
// there are at least 3 amulets in your cemetery.
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower, isAmulet } from "../targets";
import { countIn } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Holy Tiger"]);
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        condition: (g, p) => countIn(g, p, "cemetery", isAmulet) >= 3,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
    ),
  ],
});
