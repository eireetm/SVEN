// CP03-018 Medical Officer of the Rainbow Elixir — Forestcraft follower, 1, 1/1. ヴァンガード・アクアフォース. Heal Trigger.
// Ward.
// At the start of your end phase, if Aqua Force followers on your field have attacked at least 3 times this turn, give your
// leader {[defense]}+2.
// ----------
// (If this card is revealed by a drive check, give your leader {[defense]}+3.) (Resolved by the engine, CR 14.4.5.1.3.)
import { atStartOfYourEndPhase, defineCard } from "../helpers";
import { aquaForceAttacks } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    atStartOfYourEndPhase({
      condition: (g, c) => aquaForceAttacks(g, c) >= 3,
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
