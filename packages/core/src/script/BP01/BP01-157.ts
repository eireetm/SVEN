// BP01-157 Wind God — Neutral follower, 4, 1/5.
// {[fanfare]} Select a follower on your field and give it +1 attack.
// At the start of your end phase, give each follower on your field +1 attack.
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [yourFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 0);
      },
    }),
    atStartOfYourEndPhase({
      *resolve(fx) {
        for (const id of fx.game.followers(fx.controller)) yield* fx.giveStats(id, 1, 0);
      },
    }),
  ],
});
