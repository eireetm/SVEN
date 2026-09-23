// BP01-126 Moon Al-mi'raj — Havencraft follower, 5, 4/5.
// Storm. // Follower Strike: Give this follower +2 attack. (CR 12.7.2.1)
// At the start of your end phase, give this follower +2 defense. (Even when undamaged — ruling.)
import { atStartOfYourEndPhase, defineCard, followerStrike } from "../helpers";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    followerStrike({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 2, 0);
      },
    }),
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 0, 2);
      },
    }),
  ],
});
