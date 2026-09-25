// BP09-031 Master Samurai — Swordcraft follower, 3, 2/4. 兵士.
// Rush.
// {[fanfare]} Select an enemy follower on the field and deal it damage equal to this follower's
// attack. (Its attack when the ability resolves: another ability that raised it first counts —
// ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { damageEqualToAttack } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [fanfare({ targets: [enemyFollower()], resolve: damageEqualToAttack })],
});
