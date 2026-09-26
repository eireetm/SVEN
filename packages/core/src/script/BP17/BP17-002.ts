// BP17-002 Ladica, Verdant Claw — Forestcraft follower, 3, 3/3. 自然・獣.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Look at the top 5 cards of your deck. You may reveal a Natura card from among them and add it to your
// hand. Put the rest on the bottom of your deck in any order.
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { natura } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 5, { filter: natura, to: "hand" });
      },
    }),
  ],
});
