// BP20-T08 Crest: Himeka, Heir to Repose — Havencraft crest token. 絶傑・継承者・狂信.
// At the start of your end phase, select an enemy follower on the field. If there are at least 3 crests in your EX area, give
// it {[attack]}-2/{[defense]}-2. If there are at least 5 crests, give it {[attack]}-4/{[defense]}-4 instead. (Valid in the EX
// area, CR 10.3.6.)
import { atStartOfYourEndPhase, crestsInEx, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      targets: [enemyFollower()],
      *resolve(fx) {
        const n = crestsInEx(fx.game, fx.controller);
        if (n >= 3) yield* fx.giveStats(fx.targets[0]![0]!, n >= 5 ? -4 : -2, n >= 5 ? -4 : -2);
      },
    }),
  ],
});
