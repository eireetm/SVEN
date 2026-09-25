// BP07-089 Father Refinement — Havencraft follower, 5, 4/4. 機械・信仰・狂信.
// Rush.
// {[fanfare]} Put 2 Repair Mode tokens into your EX area. Recover 2 play points. (Also with a full EX
// area — ruling.)
// Strike - Draw a card. If there are 5 cards named Repair Mode in your EX area, draw 2 instead.
import { defineCard, fanfare, strike } from "../helpers";
import { named } from "../targets";
import { REPAIR, countIn } from "./shared";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([REPAIR, REPAIR]);
        yield* fx.recoverPlayPoints(2);
      },
    }),
    strike({
      *resolve(fx) {
        yield* fx.draw(countIn(fx.game, fx.controller, "ex", named(REPAIR)) === 5 ? 2 : 1);
      },
    }),
  ],
});
