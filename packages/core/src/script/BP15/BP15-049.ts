// BP15-049 Adherent of Melody — Runecraft follower, 2, 2/3. 絶傑・アイドル.
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal an Idolatry card from among them and add it to
// your hand. Put the rest on the bottom of your deck in any order.
import { defineCard, fanfare, lookAtTopCards } from "../helpers";
import { idolatry } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: idolatry, to: "hand" });
      },
    }),
  ],
});
