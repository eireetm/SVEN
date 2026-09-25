// BP07-042 Displacer Bot — Runecraft follower, 3, 3/2. 機械・ゴーレム.
// {[evolve]} {[cost02]}: Evolve this follower.
// Ward.
// {[fanfare]} Look at the top 4 cards of your deck. You may put a Machina card from among them into
// your EX area. Put the rest on the bottom of your deck in any order.
import { defineCard, evolveAbility, fanfare, lookAtTopCards } from "../helpers";
import { machina } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: machina, to: "ex" });
      },
    }),
  ],
});
