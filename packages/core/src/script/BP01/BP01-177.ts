// BP01-177 Healing Angel — Neutral follower, 3, 2/4.
// {[evolve]}{[cost01]}: Evolve this follower. // {[fanfare]} Give your leader +1 defense.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
