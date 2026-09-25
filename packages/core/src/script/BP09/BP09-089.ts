// BP09-089 Ceryneian Hind — Havencraft follower, 4, 4/4. 信仰・獣.
// {[evolve]} {[cost01]}: Evolve this follower into a Ceryneian Lighthind or Ceryneian Darkhind. (Either
// face of the double-faced BP09-090 — ruling, CR 4.6.4.)
// {[fanfare]} Look at the top 5 cards of your deck. You may reveal an amulet from among them and add it
// to your hand. Put the rest on the bottom of your deck in any order.
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1, { into: ["Ceryneian Lighthind", "Ceryneian Darkhind"] }),
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, { filter: isAmulet, to: "hand" });
      },
    }),
  ],
});
