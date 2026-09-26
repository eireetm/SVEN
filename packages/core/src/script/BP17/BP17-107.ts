// BP17-107 Android Artisan — Havencraft follower, 2, 2/3. 機械・超克.
// {[fanfare]} Put a Repair Mode token into your EX area.
// {[fanfare]} Select an enemy follower on the field and, if this was put onto the field by an ability, deal it damage
// equal to the number of Machina followers on your field. (BP17-101 summoning it counts — ruling; this follower counts.)
import { defineCard, enteredByAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { REPAIR } from "./shared";
import { machinaFollowers } from "./shared-haven";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([REPAIR]);
      },
    }),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (!enteredByAbility(fx)) return;
        const n = machinaFollowers(fx.game, fx.controller);
        if (n > 0) yield* fx.dealDamage(fx.targets[0]![0]!, n);
      },
    }),
  ],
});
