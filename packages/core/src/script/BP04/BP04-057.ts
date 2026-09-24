// BP04-057 Sibyl of the Waterwyrm — Dragoncraft follower, 3, 3/4. 竜使い.
// (BP04-058 is the same card.)
// {[fanfare]} If Overflow is active for you, give this follower +1/+1 and increase your maximum
// play points by 1 (both only with Overflow — ruling).
// At the start of your end phase, give your leader +1 defense, or +2 if Overflow is active for you.
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (!fx.game.overflow(fx.controller)) return;
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.increaseMaxPlayPoints(1);
      },
    }),
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, fx.game.overflow(fx.controller) ? 2 : 1);
      },
    }),
  ],
});
