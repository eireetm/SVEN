// BP21-102 Kyrie, Fragment of Hope — Havencraft follower, 4, 1/1. 超克.
// Ward.
// {[fanfare]} Draw a card. Recover 3 play points.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.recoverPlayPoints(3);
      },
    }),
  ],
});
