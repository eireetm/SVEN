// BP16-101 Angelic Prism Priestess — Havencraft follower, 2, 1/1. 先導・鳥族.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal an amulet from among them and add it to your hand.
// Put the rest on the bottom of your deck in any order.
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: isAmulet, to: "hand" });
      },
    }),
  ],
});
