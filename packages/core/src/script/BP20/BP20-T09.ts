// BP20-T09 Crest: Congregant of Repose — Havencraft crest token. 絶傑・狂信.
// At the start of your end phase, select an Omen follower on your field and, if there are at least 3 crests in your EX area,
// give it {[attack]}+1/{[defense]}+1. (Valid in the EX area, CR 10.3.6.)
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { yourFollower } from "../targets";
import { omen } from "./shared";
import { threeCrests } from "./shared-haven";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      targets: [yourFollower({ filter: omen })],
      *resolve(fx) {
        if (threeCrests(fx.game, fx.controller)) yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
      },
    }),
  ],
});
