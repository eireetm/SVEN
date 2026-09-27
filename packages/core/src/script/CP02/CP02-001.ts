// CP02-001 Aiko Takamori — Forestcraft follower, 3, 2/2. デレマス・パッション.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal a Passion card from among them and add it to your hand.
// Put the rest on the bottom of your deck in any order.
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { passion } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: passion, to: "hand" });
      },
    }),
  ],
});
