// BP13-100 Charitable Al-mi'raj (Evolved) — Havencraft follower, 3/3. 信仰・獣.
// Ward.
// On Evolve - Look at the top 4 cards of your deck. You may reveal a Beast card from among them and add it
// to your hand. Put the rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { beast } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: beast, to: "hand" });
      },
    }),
  ],
});
