// CP01-069 Ikuno Dictus — Havencraft follower, 3, 2/4. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Ward.
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal an amulet or Umamusume card from among them and add it to your
// hand. Put the remaining cards on the bottom of your deck in any order. (Any amulet — ruling.)
import { defineCard, fanfare, lookAtTopCards, serveAbility } from "../helpers";
import { isAmulet } from "../targets";
import { umamusume } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    serveAbility(1, 1),
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: (g, id) => isAmulet(g, id) || umamusume(g, id), to: "hand" });
      },
    }),
  ],
});
