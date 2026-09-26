// BP11-014 Cactus Cowboy — Forestcraft follower, 1, 1/1. 荒野・植物族.
// {[fanfare]} Put a Dutiful Steed token into your EX area.
// {[lastwords]} Select an enemy follower on the field and, if there are at least 3 Mount cards on your
// field and/or in your EX area, deal it 3 damage. (Both zones counted together — ruling.)
import { defineCard, fanfare, lastWords } from "../helpers";
import { enemyFollower } from "../targets";
import { mountsOnFieldAndEx, STEED } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([STEED]);
      },
    }),
    lastWords({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (mountsOnFieldAndEx(fx.game, fx.controller) >= 3) yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
