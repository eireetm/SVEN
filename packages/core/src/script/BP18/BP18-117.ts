// BP18-117 Saito, Mao Ward Officer — Neutral follower, 2, 2/2. 透京・区役所.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Look at the top 3 cards of your deck. You may reveal a Togh Keyoh card from among them and add it to your hand.
// Put the rest on the bottom of your deck in any order.
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { toghKeyoh } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: toghKeyoh, to: "hand" });
      },
    }),
  ],
});
