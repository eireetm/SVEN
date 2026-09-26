// BP08-062 Vile Violet Dragon — Dragoncraft follower, 4, 4/4. 竜族.
// {[fanfare]} During Overflow, this gets +1/+1 and Rush.
// Once on each of your turns, when it takes positive damage, draw 2. Zero damage does not trigger
// and lethal damage does (rulings, CR 5.14, 10.7.2.2, 13.4).
import { defineCard, fanfare, whenThisTakesDamage } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (!fx.game.overflow(fx.controller)) return;
        yield* fx.giveStats(fx.self, 1, 1);
        yield* fx.giveKeyword(fx.self, "rush");
      },
    }),
    whenThisTakesDamage(
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.draw(2);
        },
      },
      { onlyYourTurn: true },
    ),
  ],
});
