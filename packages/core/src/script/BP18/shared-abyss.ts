// Shared pieces of BP18 Abysscraft card scripts (not a card: the file name has no set prefix).
import type { TargetSpec } from "../types";
import { activated } from "../helpers";
import { revealFromHand } from "../costs";
import { enemyFollower } from "../targets";
import { costsTwo } from "./shared";

/**
 * BP18-082 / 083 "Activate {[engage]} this, reveal two 2-cost cards from your hand: Select an enemy follower on the field
 * and deal it 4 damage." (元のコスト.)
 */
export const serpentBite = activated(
  { engageSelf: true, custom: revealFromHand(costsTwo, 2) },
  {
    targets: [enemyFollower()] as readonly TargetSpec[],
    *resolve(fx) {
      yield* fx.dealDamage(fx.targets[0]![0]!, 4);
    },
  },
);
