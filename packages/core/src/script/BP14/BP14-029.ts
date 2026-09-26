// BP14-029 Noble Shieldmaiden — Swordcraft follower, 7, 6/5. 指揮官・貴族.
// Ward.
// {[fanfare]} Look at the top 5 cards of your deck. You may summon a follower that costs 6 or less from among
// them. Put the rest on the bottom of your deck in any order. (元のコスト.)
// {[act]} {[cost01]}, discard this: Summon a Steelclad Knight token. (Valid in the hand — ruling.)
import { discardThis } from "../costs";
import { activated, defineCard, fanfare, lookAtTopCards } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, { filter: and(isFollower, costAtMost(6)), to: "field" });
      },
    }),
    activated(
      { playPoints: 1, custom: discardThis },
      {
        validIn: ["hand"],
        *resolve(fx) {
          yield* fx.summon(["Steelclad Knight"]);
        },
      },
    ),
  ],
});
