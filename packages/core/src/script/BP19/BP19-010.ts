// BP19-010 Budding Initiate (Evolved) — 2/2.
// On Evolve - Look at the top 4 cards of your deck. You may reveal a Condemned card from among them and add it to hand. Put
// the rest on the bottom of your deck in any order.
import { defineCard, lookAtTopCards, onEvolve } from "../helpers";
import { condemned } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* lookAtTopCards(fx, 4, { filter: condemned, to: "hand" });
      },
    }),
  ],
});
