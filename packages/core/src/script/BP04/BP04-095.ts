// BP04-095 Frogbat (Evolved) — Abysscraft, 3/3.
// At the start of your end phase, give this follower and your leader +1 defense.
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 0, 1);
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
