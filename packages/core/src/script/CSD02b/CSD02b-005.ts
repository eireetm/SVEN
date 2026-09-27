// CSD02b-005 Yukimi Sajo — Abysscraft follower, 2, 2/2. デレマス・クール.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} {[cost02]}, Lesson (1): Give this follower {[attack]}+1/{[defense]}+1. (CR 10.4.7.4, 14.3.2.1.)
import { allCosts, lesson, playPointsCost } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: allCosts(playPointsCost(2), lesson(1)),
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
