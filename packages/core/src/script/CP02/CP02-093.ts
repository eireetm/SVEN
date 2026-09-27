// CP02-093 Risa Matoba — Havencraft follower, 3, 2/2. デレマス・パッション.
// {[fanfare]} Look at the top 3 cards of your deck. You may summon an iM@S CG follower that costs 2 or less from among them. Put
// the rest on the bottom of your deck in any order. (元のコスト.)
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { costAtMost } from "../targets";
import { followerThat, imas } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: (g, id) => followerThat(imas)(g, id) && costAtMost(2)(g, id), to: "field" });
      },
    }),
  ],
});
