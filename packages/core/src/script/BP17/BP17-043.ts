// BP17-043 Mega Enforcer — Runecraft follower, 3, 3/3. 機械・ゴーレム.
// At the start of your end phase, select an enemy follower on the field. If there are at least 3 Machina cards in your EX
// area, deal it 3 damage and draw a card. (Both under the condition — Q10; not without a target — ruling.)
// {[lastwords]} Put an Assembly Droid token into your EX area.
import { atStartOfYourEndPhase, defineCard, lastWords } from "../helpers";
import { enemyFollower } from "../targets";
import { DROID, machinaInEx } from "./shared";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (machinaInEx(fx.game, fx.controller) < 3) return;
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        yield* fx.draw(1);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.tokensToEx([DROID]);
      },
    }),
  ],
});
