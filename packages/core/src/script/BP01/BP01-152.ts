// BP01-152 Lucifer — Neutral follower, 7, 6/7.
// {[evolve]}{[cost00]}: Evolve this follower. // Ward.
// At the start of your end phase, give your leader +4 defense.
import { atStartOfYourEndPhase, defineCard, evolveAbility } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(0),
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 4);
      },
    }),
  ],
});
