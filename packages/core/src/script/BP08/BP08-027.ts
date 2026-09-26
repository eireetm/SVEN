// BP08-027 Madlance Centaur — Swordcraft follower, 7, 5/5. 兵士・獣.
// Rush. Strike: select an enemy follower and deal it 4 damage. CR 5.14, 12.7, 12.10.
import { defineCard, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [strike({ targets: [enemyFollower()], *resolve(fx) { yield* fx.dealDamage(fx.targets[0]![0]!, 4); } })],
});
