// BP12-049 Mechabook Sorcerer — Runecraft follower, 2, 2/3. 機械・魔法使い.
// {[fanfare]} Discard a Machina card: Draw a card. Put an Assembly Droid and Repair Mode token into your
// EX area. Then, if there are 5 Machina cards in your EX area, recover 1 play point. (Counted after the
// two tokens — ruling. "5枚なら": exactly 5.)
import { defineCard, fanfare } from "../helpers";
import { discardA } from "../costs";
import { DROID, REPAIR, countIn, machina } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(machina),
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.tokensToEx([DROID, REPAIR]);
        if (countIn(fx.game, fx.controller, "ex", machina) === 5) yield* fx.recoverPlayPoints(1);
      },
    }),
  ],
});
