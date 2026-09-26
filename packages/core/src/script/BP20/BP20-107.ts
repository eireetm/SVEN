// BP20-107 Devotee of Repose — Havencraft follower, 1, 0/2. 絶傑・狂信.
// Ward.
// {[fanfare]} Select an enemy follower on the field and deal it damage equal to the number of crests in your EX area.
import { crestsInEx, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const x = crestsInEx(fx.game, fx.controller);
        if (x > 0) yield* fx.dealDamage(fx.targets[0]![0]!, x);
      },
    }),
  ],
});
