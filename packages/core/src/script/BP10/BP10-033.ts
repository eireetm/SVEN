// BP10-033 Windslasher — Swordcraft follower, 2, 2/2. 兵士・ヒーロー.
// Rush.
// {[fanfare]} Look at the top 2 cards of your deck. You may put a Heroic card from among them into
// your EX area. Put the rest on the bottom of your deck in any order.
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: hasTrait("ヒーロー"), to: "ex" });
      },
    }),
  ],
});
