// CSD02a-011 Karin Domyoji — Havencraft follower, 3, 3/3. デレマス・キュート.
// Ward.
// {[fanfare]} Discard a Cute card: Give this follower {[defense]}+2. Draw a card.
import { discardA } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { cute } from "../CP02/shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      cost: discardA(cute),
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 0, 2);
        yield* fx.draw(1);
      },
    }),
  ],
});
