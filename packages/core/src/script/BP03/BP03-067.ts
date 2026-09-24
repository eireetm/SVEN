// BP03-067 Elder Tortoise — Dragoncraft follower, 4, 3/5. 海洋.
// {[fanfare]} Gain 1 evolution point. If Overflow is active for you, +2/+2.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.gainEvolutionPoints(1);
        if (fx.game.overflow(fx.controller)) yield* fx.giveStats(fx.self, 2, 2);
      },
    }),
  ],
});
