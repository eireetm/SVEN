// BP07-106 Mechawing Angel — Neutral follower, 3, 3/3. 機械・天使.
// Ward.
// {[fanfare]} Put an Assembly Droid or Repair Mode token into your EX area.
// Activate {[engage]}: Select an enemy follower on the field and deal it 4 damage. Activate only if
// there are at least 5 Machina cards in your cemetery.
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { countIn, droidOrRepairToEx, machina } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({ resolve: droidOrRepairToEx }),
    activated(
      { engageSelf: true },
      {
        condition: (g, c) => countIn(g, c, "cemetery", machina) >= 5,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        },
      },
    ),
  ],
});
