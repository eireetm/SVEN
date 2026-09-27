// CP02-089 Nana Abe — Havencraft follower, 3, 3/2. デレマス・キュート.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Look at the top 5 cards of your deck. You may reveal an amulet from among them and add it to your hand. Put the
// rest on the bottom of your deck in any order.
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, { filter: isAmulet, to: "hand" });
      },
    }),
  ],
});
