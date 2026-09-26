// BP14-065 Dragon Breeder (Evolved) — Dragoncraft follower, 2/2. 竜使い.
// On Evolve - Look at the top 4 cards of your deck. You may put a {[dragoncraft]} follower that costs 3 or less
// from among them into your EX area and give it {[attack]}+1/{[defense]}+1. Put the rest on the bottom of your
// deck in any order. (元のコスト; the +1/+1 stays when it goes from the EX area to the field, CR 10.6.2.1.3.)
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { and, costAtMost, isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        for (const id of yield* lookAtTopCards(fx, 4, { filter: and(isFollower, isClass("Dragoncraft"), costAtMost(3)), to: "ex" })) {
          yield* fx.giveStats(id, 1, 1);
        }
      },
    }),
  ],
});
