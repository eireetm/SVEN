// BP06-066 Aquascale Stalwart — Dragoncraft follower, 2, 1/4. 竜使い.
// Ward.
// {[fanfare]} If Overflow is active for you, look at the top 5 cards of your deck. You may reveal a
// {[dragoncraft]} follower that costs 5 or more from among them and add it to your hand. Put the
// rest on the bottom of your deck in any order.
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { and, costAtLeast, isClass, isFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        if (!fx.game.overflow(fx.controller)) return;
        yield* lookAtTopCards(fx, 5, { filter: and(isFollower, isClass("Dragoncraft"), costAtLeast(5)), to: "hand" });
      },
    }),
  ],
});
