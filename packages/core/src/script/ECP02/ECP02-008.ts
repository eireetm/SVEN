// ECP02-008 Hinako Kita [True Dream] — Forestcraft follower, 1, 1/1. デレマス・パッション.
// {[evolve]} {[cost02]}: Evolve this.
// {[fanfare]}, Lesson (1): Give your leader {[defense]}+1.
import { lesson } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      cost: lesson(1),
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
