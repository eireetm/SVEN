// CP02-057 Tsukasa Kiryu — Dragoncraft follower, 6, 5/5. デレマス・クール.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[evolve]}, Lesson (3): {[evolve]} this follower. (An evolve ability whose cost is Lesson (3) and no play points, so no
// evolution point can stand in for one — CR 12.2.3, 14.3.2.1.)
// {[fanfare]} Increase your max play points by 1.
import { lesson } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(2),
    evolveAbility({ custom: lesson(3) }),
    fanfare({
      *resolve(fx) {
        yield* fx.increaseMaxPlayPoints(1);
      },
    }),
  ],
});
