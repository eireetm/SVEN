// BP12-064 Dragoon Medic (Evolved) — Dragoncraft follower, 1/2. 竜使い.
// At the start of your end phase, give your leader {[defense]}+2.
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
