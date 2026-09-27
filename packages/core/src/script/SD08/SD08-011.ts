// SD08-011 Zahar, Stormwave Dragoon — Dragoncraft follower, 8, 4/4. 竜使い・海洋.
// When this is discarded, look at the top 2 cards of your deck. You may reveal a {[dragoncraft]} card that costs 7 or more from
// among them and add it to your hand. Put the rest on the bottom of your deck in any order. (元のコスト. Also during the opponent's
// turn — ruling.)
// {[fanfare]} Look at the top 3 cards of your deck. You may summon a {[dragoncraft]} follower not named Zahar, Stormwave Dragoon from
// among them. Put the rest on the bottom of your deck in any order.
import { defineCard, fanfare, lookAtTopCards, whenDiscarded } from "../helpers";
import { and, costAtLeast, isClass, isFollower, named } from "../targets";

const ZAHAR = "Zahar, Stormwave Dragoon";

export default defineCard({
  abilities: [
    whenDiscarded({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 2, { filter: and(isClass("Dragoncraft"), costAtLeast(7)), to: "hand" });
      },
    }),
    fanfare({
      *resolve(fx) {
        const filter = and(isFollower, isClass("Dragoncraft"), (g, id) => !named(ZAHAR)(g, id));
        yield* lookAtTopCards(fx, 3, { filter, to: "field" });
      },
    }),
  ],
});
