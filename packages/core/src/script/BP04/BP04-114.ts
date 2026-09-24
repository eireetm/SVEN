// BP04-114 Octobishop — Havencraft follower, 4, 4/4. 信仰・獣.
// Ward.
// At the start of your end phase, give this follower +0/+2.
import { atStartOfYourEndPhase, defineCard } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 0, 2);
      },
    }),
  ],
});
