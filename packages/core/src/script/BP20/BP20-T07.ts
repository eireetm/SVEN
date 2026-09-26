// BP20-T07 Crest: Marwynn, Despair Manifest — Havencraft crest token. 絶傑・狂信.
// At the start of your end phase, select an enemy leader or enemy follower on the field and deal it 1 damage. If there are at
// least 3 crests in your EX area, deal it 2 damage. If there are at least 5 crests, deal it 4 damage instead. (Valid in the EX
// area, CR 10.3.6; 「5枚なら」: the EX area holds 5, so "at least 5" is the same.)
import { atStartOfYourEndPhase, crestsInEx, defineCard } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        const n = crestsInEx(fx.game, fx.controller);
        yield* fx.dealDamage(fx.targets[0]![0]!, n >= 5 ? 4 : n >= 3 ? 2 : 1);
      },
    }),
  ],
});
