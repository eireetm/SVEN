// BP08-091 Sekhmet — Havencraft follower, 2, 2/3. 信仰・獣.
// Activate, engage, bury an amulet: select an enemy follower; deal 4 to it and 1 to its leader.
// Burying is not destruction and ignores Aura because it is a cost choice (CR 5.34, 10.4.3, 12.15).
import { buryFromYourField } from "../costs";
import { activated, defineCard } from "../helpers";
import { enemyFollower, isAmulet } from "../targets";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true, custom: buryFromYourField(isAmulet) },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          const leader = fx.game.leader(fx.game.controller(target));
          yield* fx.dealDamages([{ target, amount: 4 }, { target: leader, amount: 1 }]);
        },
      },
    ),
  ],
});
