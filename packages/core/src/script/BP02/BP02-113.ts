// BP02-113 Unicorn Dancer Unica — Neutral follower, 2, 2/2.
// {[evolve]}{[cost01]}: Evolve this follower.
// Strike: Give your leader {[defense]}+2.
import { defineCard, evolveAbility, strike } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    strike({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
