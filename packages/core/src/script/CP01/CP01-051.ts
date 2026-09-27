// CP01-051 Super Creek — Dragoncraft follower, 6, 5/5. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Ward.
// {[fanfare]} Give your leader {[defense]}+5.
import { defineCard, fanfare, serveAbility } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 5);
      },
    }),
  ],
});
