// CSD03a-009 Little Sage, Marron — Swordcraft follower, 3, 3/4. ヴァンガード・ロイヤルパラディン.
// Ward.
// {[fanfare]} Look at the top 5 cards of your deck. You may reveal a Royal Paladin card from among them and add it to your hand. Put
// the rest on the bottom of your deck in any order.
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { royalPaladin } from "../CP03/shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, { filter: royalPaladin, to: "hand" });
      },
    }),
  ],
});
