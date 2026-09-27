// CSD02a-006 Momoka Sakurai (Evolved) — 3/3.
// On Evolve - Look at the top 3 cards of your deck. You may reveal a Cute card from among them and add it to your hand. Put the rest
// on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { cute } from "../CP02/shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: cute, to: "hand" });
      },
    }),
  ],
});
