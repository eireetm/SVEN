// BP18-033 Blind Spot Surveyor (Evolved) — 2/2.
// On Evolve -Look at the top 3 cards of your deck. You may reveal a Togh Keyoh card from among them and add it to your hand.
// Put the rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { toghKeyoh } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 3, { filter: toghKeyoh, to: "hand" });
      },
    }),
  ],
});
