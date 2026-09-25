// BP09-040 Snowman King — Runecraft follower, 6, 4/6. 魔法生物.
// While this card is on the field, followers that cost 3 or less on the field can't attack enemies.
// (元のコスト; followers of both players, and not even engaged enemy followers — rulings.)
// {[lastwords]} Give your leader {[defense]}+3.
import { defineCard, lastWords } from "../helpers";
import { costAtMost } from "../targets";

export default defineCard({
  field: { preventsAttack: (g, _self, follower) => costAtMost(3)(g, follower) },
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
  ],
});
