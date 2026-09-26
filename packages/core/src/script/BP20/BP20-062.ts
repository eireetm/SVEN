// BP20-062 Congregant of Disdain — Dragoncraft follower, 3, 3/4. 絶傑・竜族.
// Once on each of your turns, when this takes ability damage, increase your max play points by 1. (Also when it is
// destroyed by it — rulings.)
// {[fanfare]} If Overflow is active for you, deal each follower on the field 1 damage.
import { defineCard, fanfare, whenThisTakesDamage } from "../helpers";

export default defineCard({
  abilities: [
    {
      ...whenThisTakesDamage(
        {
          *resolve(fx) {
            yield* fx.increaseMaxPlayPoints(1);
          },
        },
        { onlyYourTurn: true, ability: true },
      ),
      oncePerTurn: true,
    },
    fanfare({
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* fx.dealDamageEach([...fx.game.followers(0), ...fx.game.followers(1)], 1);
      },
    }),
  ],
});
