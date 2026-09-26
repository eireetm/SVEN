// BP13-063 Empyreal Dragon — Dragoncraft follower, 7, 5/6. 竜族.
// Ward.
// {[fanfare]} Look at the top 5 cards of your deck. You may reveal any number of {[dragoncraft]} cards that
// cost 7 or more and add them to your hand. Put the rest on the bottom of your deck in any order.
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { and, costAtLeast, isClass } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, { filter: and(isClass("Dragoncraft"), costAtLeast(7)), to: "hand", max: 5 });
      },
    }),
  ],
});
