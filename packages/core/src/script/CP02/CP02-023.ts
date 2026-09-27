// CP02-023 Uzuki Shimamura — Swordcraft follower, 3, 3/3. デレマス・キュート.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]}, Lesson (1): Give your leader {[defense]}+1. (A cost of the Fanfare, CR 10.4.7.4, 14.3.2.1.)
import { lesson } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: lesson(1),
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
      },
    }),
  ],
});
