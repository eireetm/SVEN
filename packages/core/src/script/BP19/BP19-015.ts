// BP19-015 Merchant of the Wood — Forestcraft follower, 4, 4/3. 商人・獣.
// Rush.
// {[fanfare]} Draw 2 cards.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
  ],
});
