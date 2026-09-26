// BP14-103 Al-mi'raj Defender — Havencraft follower, 5, 4/4. 信仰・獣.
// Ward.
// {[fanfare]} Look at the top 5 cards of your deck. You may put one of them into your EX area. If it's a Beast
// follower that costs 4 or less, it costs 4 less to play this turn. Put the rest on the bottom of your deck in any
// order. (元のコスト.)
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";
import { beast } from "./shared";

const cheapBeast = and(isFollower, beast, costAtMost(4));

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        for (const id of yield* lookAtTopCards(fx, 5, { filter: () => true, to: "ex" })) {
          if (cheapBeast(fx.game, id)) yield* fx.changePlayCost(id, -4, "endOfTurn");
        }
      },
    }),
  ],
});
