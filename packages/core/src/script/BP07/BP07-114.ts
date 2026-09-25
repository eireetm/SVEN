// BP07-114 Aldis, Trendsetting Seraph — Neutral follower, 5, 4/5. 天使.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Give your leader {[defense]}+3.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
