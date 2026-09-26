// BP10-016 Blossoming Archer — Forestcraft follower, 1, 2/2. エルフ族・狩人・植物族.
// {[fanfare]} Select an enemy follower on the field and, if there are at least 3 cards with different
// base costs in your EX area, deal it 3 damage.
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { distinctCostsInEx } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (distinctCostsInEx(fx.game, fx.controller) >= 3) yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
