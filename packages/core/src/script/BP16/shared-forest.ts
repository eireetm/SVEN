// Shared pieces of BP16 Forestcraft card scripts (not a card: the file name has no set prefix).
import type { TimingSpec } from "../helpers";
import { enemyFollower } from "../targets";

/**
 * BP16-009 / 099 "Select an enemy follower on the field. It can't attack enemies during its controller's next
 * turn." (Neither followers nor leaders — ruling, CR 8.4.3.2.1.)
 */
export const frostwardLock: TimingSpec = {
  targets: [enemyFollower()],
  *resolve(fx) {
    yield* fx.cannotAttack(fx.targets[0]![0]!, "endOfOpponentsNextTurn");
  },
};
