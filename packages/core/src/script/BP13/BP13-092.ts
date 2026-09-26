// BP13-092 Lunerian Paladin (Evolved) — Havencraft follower, 2/2. 信仰・獣.
// Ward.
// On Evolve - Look at the top 4 cards of your deck. You may summon a follower that costs 2 or less from
// among them. Put the rest on the bottom of your deck in any order. If you summoned a follower with Ward,
// give your leader {[defense]}+2. (元のコスト; Ward as it is on the field.)
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { and, costAtMost, isFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        const [summoned] = yield* lookAtTopCards(fx, 4, { filter: and(isFollower, costAtMost(2)), to: "field" });
        if (summoned !== undefined && fx.game.card(summoned)?.zone === "field" && fx.game.hasKeyword(summoned, "ward")) {
          yield* fx.giveLeaderDefense(fx.controller, 2);
        }
      },
    }),
  ],
});
