// BP05-T01 Destruction in White — Runecraft amulet token, 1. 絶傑・アイドル.
// At the start of your main phase, give your leader {[defense]}+2.
import { atStartOfYourMainPhase, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    atStartOfYourMainPhase({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
