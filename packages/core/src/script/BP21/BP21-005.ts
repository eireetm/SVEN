// BP21-005 Cleaver Cat — Forestcraft follower, 2, 2/2. 学院・獣・コック.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Discard a card: Look at the top 3 cards of your deck. You may reveal an Academic or Beast card from among them
// and add it to your hand. Put the rest on the bottom of your deck in any order.
import { discardA } from "../costs";
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { academic, beast } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: discardA(() => true),
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: (g, id) => academic(g, id) || beast(g, id), to: "hand" });
      },
    }),
  ],
});
