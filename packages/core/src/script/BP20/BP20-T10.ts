// BP20-T10 Crest: Supplicant of Repose — Havencraft crest token. 絶傑・狂信.
// At the start of your end phase, if there are at least 3 crests in your EX area, give your leader {[defense]}+1. (Valid in
// the EX area, CR 10.3.6.)
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { threeCrests } from "./shared-haven";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        if (threeCrests(fx.game, fx.controller)) yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
