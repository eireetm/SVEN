// BP05-097 Servant of Repose — Havencraft follower, 2, 2/3. 絶傑・狂信.
// At the start of each opponent's main phase, give your leader {[defense]}+1.
import { atStartOfOpponentsMainPhase, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    atStartOfOpponentsMainPhase({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
