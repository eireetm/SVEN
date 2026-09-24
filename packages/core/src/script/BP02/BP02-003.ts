// BP02-003 White Wolf of Eldwood — Forestcraft follower, 7, 4/4.
// Storm.
// {[lastwords]} Look at the top 4 cards of your deck. You may put a {[forestcraft]} follower from
// among them onto your field. Put the remaining cards on the bottom of your deck in any order.
// (Putting none is allowed — ruling.)
import { defineCard, lastWords, lookAtTopCards } from "../helpers";
import { and, isClass, isFollower } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: and(isFollower, isClass("Forestcraft")), to: "field" });
      },
    }),
  ],
});
