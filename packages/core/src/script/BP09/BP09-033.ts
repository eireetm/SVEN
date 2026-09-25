// BP09-033 Tycoon — Swordcraft follower, 5, 3/3. 貴族・商人.
// {[fanfare]} Discard 3 cards: Draw 3 cards. Recover 2 play points.
import { discardCardsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardCardsCost(3),
      *resolve(fx) {
        yield* fx.draw(3);
        yield* fx.recoverPlayPoints(2);
      },
    }),
  ],
});
