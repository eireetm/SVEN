// BP01-119 Spectre — Abysscraft follower, 2, 2/1.
// Bane. // {[fanfare]} Give your leader -2 defense: Give this follower Rush. Put the top card of
// your deck into your cemetery. (Optional; needs at least 2 defense — rulings.)
import { defineCard, fanfare } from "../helpers";
import { leaderDefenseCost } from "../costs";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    fanfare({
      cost: leaderDefenseCost(2),
      *resolve(fx) {
        yield* fx.giveKeyword(fx.self, "rush");
        yield* fx.mill(1);
      },
    }),
  ],
});
