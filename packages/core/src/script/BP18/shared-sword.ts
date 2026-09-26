// Shared pieces of BP18 Swordcraft card scripts (not a card: the file name has no set prefix).
import type { TimingSpec } from "../helpers";
import { enemyFollower } from "../targets";

/**
 * BP18-034 / 035 "Select an enemy follower on the field and deal it damage equal to the number of followers on your
 * field." (Counted as it resolves.)
 */
export const monikaVolley: TimingSpec = {
  targets: [enemyFollower()],
  *resolve(fx) {
    const n = fx.game.followers(fx.controller).length;
    if (n > 0) yield* fx.dealDamage(fx.targets[0]![0]!, n);
  },
};
